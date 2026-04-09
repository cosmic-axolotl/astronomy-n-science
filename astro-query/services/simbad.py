from astroquery.simbad import Simbad
from astroquery.exceptions import RemoteServiceError
import math
import logging

logger = logging.getLogger(__name__)

MIN_PARALLAX_MAS = 0.1


def _make_simbad_client() -> Simbad:
    s = Simbad()
    s.add_votable_fields(
        'otype',
        'sp_type',
        'V',              # era 'flux(V)'
        'parallax',
        'rvz_radvel',      # era 'rv_value'
        'rvz_redshift',
        'ids',
    )
    return s

def _safe(value, cast=str, default=None):
    try:
        if value is None:
            return default
        if cast in (float, int) and math.isnan(float(value)):
            return default
        result = cast(value)
        if cast == str and result.strip() in ('', '--', 'nan'):
            return default
        return result
    except (ValueError, TypeError):
        return default


def _parallax_to_distance(parallax_mas):
    if parallax_mas is None or parallax_mas < MIN_PARALLAX_MAS:
        return None, None
    pc = 1000.0 / parallax_mas
    ly = pc * 3.26156
    return round(pc, 2), round(ly, 2)


def _row_to_dict(row) -> dict:
    plx = _safe(row['plx_value'], float)
    dist_pc, dist_ly = _parallax_to_distance(plx)

    ids_raw = _safe(row['ids'], str, '')
    aliases = [i.strip() for i in ids_raw.split('|') if i.strip()][:8]

    return {
        'name':            _safe(row['main_id']),
        'aliases':         aliases,
        'object_type':     _safe(row['otype']),
        'ra':              _safe(row['ra']),
        'dec':             _safe(row['dec']),
        'spectral_type':   _safe(row['sp_type']),
        'magnitude_v':     _safe(row['V'], float),
        'parallax_mas':    plx,
        'distance_pc':     dist_pc,
        'distance_ly':     dist_ly,
        'radial_velocity': _safe(row['rvz_radvel'], float),
        'redshift':        _safe(row['rvz_redshift'], float),
        'catalogs':        ['SIMBAD'],
    }

def _tap_row_to_dict(row) -> dict:
    plx = _safe(row['plx_value'], float)
    dist_pc, dist_ly = _parallax_to_distance(plx)
    return {
        'name':                _safe(row['main_id']),
        'object_type':         _safe(row['otype']),
        'ra':                  _safe(row['ra']),
        'dec':                 _safe(row['dec']),
        'spectral_type':       _safe(row['sp_type']),
        'distance_ly':         dist_ly,
        'apparent_magnitude':  None,
        'radial_velocity_kms': _safe(row['rvz_radvel'], float),
        'redshift':            _safe(row['rvz_redshift'], float),
        'catalogs':            ['SIMBAD'],
        'match_score':         1.0,
    }

def query_single_object(name: str) -> dict | None:
    try:
        simbad = _make_simbad_client()
        result = simbad.query_object(name)

        if result is None or len(result) == 0:
            return None

        return _row_to_dict(result[0])

    except RemoteServiceError as e:
        logger.error(f'Erro no SIMBAD ao buscar {name!r}: {e}')
        raise

    except Exception as e:
        logger.error(f'Erro inesperado ao buscar {name!r}: {e}')
        return None


def query_by_type(otype_code: str, limit: int = 30) -> list:
    try:
        query = f"""
            SELECT TOP {limit}
                b.main_id, b.ra, b.dec, b.otype,
                b.sp_type, b.plx_value,
                b.rvz_radvel, b.rvz_redshift
            FROM basic AS b
            WHERE b.otype = '{otype_code}'
        """

        result = Simbad.query_tap(query)

        if result is None or len(result) == 0:
            return []

        return [_tap_row_to_dict(row) for row in result]

    except Exception as e:
        logger.error(f'Erro ao buscar tipo {otype_code!r}: {e}')
        return []
    
def query_cluster_members(canonical_name: str, limit: int = 50) -> list:
    '''
    Busca membros de um aglomerado via SIMBAD TAP.
    Recebe o nome canônico já resolvido (ex: 'Cl Melotte  22').
    '''
    try:
        canonical_escaped = canonical_name.replace("'", "''")

        query = f"""
            SELECT TOP {limit}
                b.main_id, b.ra, b.dec, b.otype,
                b.sp_type, b.plx_value,
                b.rvz_radvel, b.rvz_redshift
            FROM basic AS b
            JOIN h_link AS h ON h.child = b.oid
            JOIN basic AS parent ON parent.oid = h.parent
            WHERE parent.main_id = '{canonical_escaped}'
        """

        result = Simbad.query_tap(query)

        if result is None or len(result) == 0:
            return []

        return [_tap_row_to_dict(row) for row in result]

    except Exception as e:
        logger.error(f'Erro ao buscar membros de {canonical_name!r}: {e}')
        return []

def query_cluster_info(name: str) -> dict | None:
    '''
    Busca informações básicas de um aglomerado pelo nome.
    Usa cliente SIMBAD simples sem campos extras que podem falhar.
    '''
    try:
        simbad = Simbad()
        result = simbad.query_object(name)

        if result is None or len(result) == 0:
            return None

        row = result[0]
        plx = _safe(row['plx_value'], float) if 'plx_value' in result.colnames else None
        dist_pc, dist_ly = _parallax_to_distance(plx)

        return {
            'name':        str(row['main_id']).strip(),
            'aliases':     [],
            'object_type': str(row['otype']).strip() if 'otype' in result.colnames else 'Cl*',
            'ra':          str(row['ra']),
            'dec':         str(row['dec']),
            'distance_pc': dist_pc,
            'distance_ly': dist_ly,
            'parallax_mas':plx,
            'catalogs':    ['SIMBAD'],
        }

    except Exception as e:
        logger.error(f'Erro ao buscar aglomerado {name!r}: {e}')
        return None