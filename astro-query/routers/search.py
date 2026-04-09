from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services.crossmatch import enrich_object
from services.simbad import query_single_object, query_by_type, query_cluster_members
from models.schemas import (
    SingleResponse, ListResponse,
    ObjectResult, ListItem, Coordinates, Magnitude,
    Enrichments, HipparcosData, TwoMassData, AdsArticle
)

router = APIRouter(
    prefix='/search',
    tags=['Search'],
)

OTYPE_MAP = {
    'wolf rayet':        'WR*',
    'wolf-rayet':        'WR*',
    'pulsar':            'Psr',
    'neutron star':      'NS',
    'cepheid':           'Ce*',
    'rr lyrae':          'RR*',
    'white dwarf':       'WD*',
    'galaxy':            'G',
    'quasar':            'QSO',
    'agn':               'AGN',
    'open cluster':      'OpC',
    'globular':          'GlC',
    'supergiant':        'sg*',
    'red giant':         'RG*',
    'brown dwarf':       'BD*',
    'planetary nebula':  'PN',
    'supernova remnant': 'SNR',
    'black hole':        'BH',
}


@router.get('/object', response_model=SingleResponse)
async def search_object(
    name:              str  = Query(..., description='Nome do objeto: * alf Ori, M31, NGC 224'),
    include_hipparcos: bool = Query(True,  description='Incluir dados do Hipparcos'),
    include_2mass:     bool = Query(True,  description='Incluir fotometria 2MASS'),
    include_ads:       bool = Query(False, description='Incluir artigos NASA/ADS'),
    ads_limit:         int  = Query(3, ge=1, le=10),
):
    '''Busca objeto com enriquecimento de múltiplos catálogos.'''
    try:
        raw = enrich_object(
            name,
            include_hipparcos=include_hipparcos,
            include_2mass=include_2mass,
            include_ads=include_ads,
            ads_limit=ads_limit,
        )
    except Exception:
        raise HTTPException(status_code=503, detail='Serviço indisponível.')

    if raw is None:
        raise HTTPException(
            status_code=404,
            detail=f'Objeto {name!r} não encontrado.',
        )

    # Coordenadas
    coords = None
    if raw.get('ra') and raw.get('dec'):
        coords = Coordinates(ra=raw['ra'], dec=raw['dec'])

    # Magnitude
    mag = None
    if raw.get('magnitude_v') is not None:
        mag = Magnitude(apparent=raw['magnitude_v'])

    # Objeto base
    obj = ObjectResult(
        name=raw['name'],
        aliases=raw.get('aliases', []),
        object_type=raw['object_type'] or 'Unknown',
        coordinates=coords,
        spectral_type=raw.get('spectral_type'),
        distance_pc=raw.get('distance_pc'),
        distance_ly=raw.get('distance_ly'),
        magnitude=mag,
        radial_velocity_kms=raw.get('radial_velocity'),
        redshift=raw.get('redshift'),
        catalogs=raw.get('sources', ['SIMBAD']),
    )

    # Enriquecimentos
    enrichments = None
    raw_enr = raw.get('enrichments', {})
    if raw_enr:
        hip_data   = None
        tmass_data = None
        ads_data   = None

        if raw_enr.get('hipparcos'):
            h = raw_enr['hipparcos']
            hip_data = HipparcosData(
                hip_id=h.get('hip_id'),
                magnitude_v=h.get('magnitude_v'),
                color_bv=h.get('color_bv'),
                parallax_mas=h.get('parallax_mas'),
                parallax_err=h.get('parallax_err'),
                distance_ly=h.get('distance_ly'),
                pm_ra=h.get('pm_ra'),
                pm_dec=h.get('pm_dec'),
            )

        if raw_enr.get('2mass'):
            t = raw_enr['2mass']
            tmass_data = TwoMassData(
                two_mass_id=t.get('2mass_id'),
                j_mag=t.get('j_mag'),
                h_mag=t.get('h_mag'),
                k_mag=t.get('k_mag'),
                quality=t.get('quality'),
            )

        if raw_enr.get('ads_articles'):
            ads_data = [
                AdsArticle(**a) for a in raw_enr['ads_articles']
            ]

        enrichments = Enrichments(
            hipparcos=hip_data,
            two_mass=tmass_data,
            ads_articles=ads_data,
        )

    return SingleResponse(
        object=obj,
        enrichments=enrichments,
        sources=raw.get('sources', ['SIMBAD']),
        confidence='high',
    )


@router.get('/type', response_model=ListResponse)
async def search_by_type(
    query: str = Query(..., description='Tipo: wolf rayet, pulsar, cepheid...'),
    limit: int = Query(20, ge=1, le=100),
):
    '''Busca objetos por tipo ou classe.'''
    query_lower  = query.lower().strip()
    otype_code   = None
    matched_term = None

    for term, code in OTYPE_MAP.items():
        if term in query_lower:
            otype_code   = code
            matched_term = term
            break

    if otype_code is None:
        raise HTTPException(
            status_code=422,
            detail={
                'message':   f'Tipo {query!r} não reconhecido.',
                'available': list(OTYPE_MAP.keys()),
            },
        )

    raw_list = query_by_type(otype_code, limit=limit)
    items    = [ListItem(**r) for r in raw_list]

    return ListResponse(
        query_interpretation=f'{len(items)} objetos do tipo {matched_term}',
        results=items,
        sources=['SIMBAD'],
    )

from services.simbad import query_single_object, query_by_type, query_cluster_members, query_cluster_info

@router.get('/cluster')
async def search_cluster(
    name:  str = Query(..., description='Nome do aglomerado: Pleiades, Hyades, NGC 2516...'),
    limit: int = Query(50, ge=1, le=200),
):
    '''Busca um aglomerado estelar e seus membros catalogados.'''
    try:
        raw = query_cluster_info(name)
    except Exception:
        raise HTTPException(status_code=503, detail='Serviço indisponível.')

    if raw is None:
        raise HTTPException(
            status_code=404,
            detail=f'Aglomerado {name!r} não encontrado.',
        )

    members = query_cluster_members(raw['name'], limit=limit)

    coords = None
    if raw.get('ra') and raw.get('dec'):
        coords = Coordinates(ra=raw['ra'], dec=raw['dec'])

    obj = ObjectResult(
        name=raw['name'],
        aliases=raw.get('aliases', []),
        object_type=raw['object_type'] or 'OpC',
        coordinates=coords,
        distance_pc=raw.get('distance_pc'),
        distance_ly=raw.get('distance_ly'),
        catalogs=raw.get('catalogs', ['SIMBAD']),
    )

    return {
        'mode':          'cluster',
        'cluster':       obj,
        'members':       members,
        'sources':       ['SIMBAD'],
        'total_members': len(members),
    }