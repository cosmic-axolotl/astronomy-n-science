from services.simbad import query_single_object
from services.vizier import query_hipparcos, query_2mass
from services.ads   import query_articles
import logging

logger = logging.getLogger(__name__)


def enrich_object(
    name: str,
    include_hipparcos: bool = True,
    include_2mass:     bool = True,
    include_ads:       bool = False,
    ads_limit:         int  = 3,
) -> dict | None:
    '''
    Busca um objeto no SIMBAD e enriquece com dados de outros catálogos.
    Retorna dicionário unificado ou None se objeto não encontrado.
    '''
    # 1. Busca base no SIMBAD
    base = query_single_object(name)
    if base is None:
        return None

    result = dict(base)
    result['sources']      = ['SIMBAD']
    result['enrichments']  = {}

    ra  = base.get('ra')
    dec = base.get('dec')

    # 2. Hipparcos
    if include_hipparcos:
        hip = query_hipparcos(name, ra=ra, dec=dec)
        if hip:
            result['enrichments']['hipparcos'] = hip
            result['sources'].append('Hipparcos')
            if hip.get('parallax_mas') and (
                result.get('parallax_mas') is None
                or hip.get('parallax_err', 99) < 0.5
            ):
                result['parallax_mas'] = hip['parallax_mas']
                result['distance_ly']  = hip['distance_ly']
            if hip.get('magnitude_v'):
                result['magnitude_v'] = hip['magnitude_v']

    # 3. 2MASS
    if include_2mass:
        tmass = query_2mass(name, ra=ra, dec=dec)
        if tmass:
            result['enrichments']['2mass'] = tmass
            result['sources'].append('2MASS')

    # 4. NASA/ADS
    if include_ads:
        articles = query_articles(base.get('name', name), limit=ads_limit)
        if articles:
            result['enrichments']['ads_articles'] = articles
            result['sources'].append('NASA/ADS')

    return result