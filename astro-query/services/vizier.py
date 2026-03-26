from astroquery.vizier import Vizier
from astropy.coordinates import SkyCoord
import astropy.units as u
import math
import logging

logger = logging.getLogger(__name__)


def _resolve_coordinates(name: str):
    try:
        return SkyCoord.from_name(name)
    except Exception as e:
        logger.warning(f'Não foi possível resolver coordenadas de {name!r}: {e}')
        return None


def _safe(value, cast=float, default=None):
    try:
        if value is None:
            return default
        result = cast(value)
        if cast == float and math.isnan(result):
            return default
        return result
    except (ValueError, TypeError):
        return default


def query_hipparcos(name: str, ra: str = None, dec: str = None) -> dict | None:
    try:
        if ra and dec:
            coords = SkyCoord(ra=ra, dec=dec, unit=(u.deg, u.deg))
        else:
            coords = _resolve_coordinates(name)
            if coords is None:
                return None

        v = Vizier(columns=['HIP', 'Vmag', 'Plx', 'e_Plx', 'pmRA', 'pmDE', 'B-V'])
        result = v.query_region(
            coords,
            radius=10 * u.arcsec,
            catalog='I/239',
        )

        if not result or len(result[0]) == 0:
            return None

        row = result[0][0]
        plx = _safe(row['Plx'])
        dist_ly = round(3261.56 / plx, 1) if plx and plx > 0.1 else None

        return {
            'hip_id':       int(_safe(row['HIP'], int, 0)),
            'magnitude_v':  _safe(row['Vmag']),
            'color_bv':     _safe(row['B-V']),
            'parallax_mas': plx,
            'parallax_err': _safe(row['e_Plx']),
            'distance_ly':  dist_ly,
            'pm_ra':        _safe(row['pmRA']),
            'pm_dec':       _safe(row['pmDE']),
            'catalog':      'Hipparcos I/239',
        }

    except Exception as e:
        logger.error(f'Erro no Hipparcos para {name!r}: {e}')
        return None


def query_2mass(name: str, ra: str = None, dec: str = None) -> dict | None:
    try:
        if ra and dec:
            coords = SkyCoord(ra=ra, dec=dec, unit=(u.deg, u.deg))
        else:
            coords = _resolve_coordinates(name)
            if coords is None:
                return None

        v = Vizier(columns=['_2MASS', 'Jmag', 'e_Jmag', 'Hmag', 'e_Hmag', 'Kmag', 'e_Kmag', 'Qflg'])
        result = v.query_region(
            coords,
            radius=5 * u.arcsec,
            catalog='II/246',
        )

        if not result or len(result[0]) == 0:
            return None

        row = result[0][0]
        return {
            '2mass_id': str(row['_2MASS']).strip(),
            'j_mag':    _safe(row['Jmag']),
            'j_err':    _safe(row['e_Jmag']),
            'h_mag':    _safe(row['Hmag']),
            'h_err':    _safe(row['e_Hmag']),
            'k_mag':    _safe(row['Kmag']),
            'k_err':    _safe(row['e_Kmag']),
            'quality':  str(row['Qflg']).strip(),
            'catalog':  '2MASS II/246',
        }

    except Exception as e:
        logger.error(f'Erro no 2MASS para {name!r}: {e}')
        return None