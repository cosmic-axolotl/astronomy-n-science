from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from services.simbad import query_single_object, query_by_type
from models.schemas import (
    SingleResponse, ListResponse,
    ObjectResult, ListItem, Coordinates, Magnitude
)

router = APIRouter(
    prefix='/search',
    tags=['Search'],
)

OTYPE_MAP = {
    'wolf rayet':       'WR*',
    'wolf-rayet':       'WR*',
    'pulsar':           'Psr',
    'neutron star':     'NS',
    'cepheid':          'Ce*',
    'rr lyrae':         'RR*',
    'white dwarf':      'WD*',
    'galaxy':           'G',
    'quasar':           'QSO',
    'agn':              'AGN',
    'open cluster':     'OpC',
    'globular':         'GlC',
    'supergiant':       'sg*',
    'red giant':        'RG*',
    'brown dwarf':      'BD*',
    'planetary nebula': 'PN',
    'supernova remnant':'SNR',
    'black hole':       'BH',
}


@router.get('/object', response_model=SingleResponse)
async def search_object(
    name: str = Query(..., description='Nome do objeto: Betelgeuse, M31, NGC 224'),
    include_vizier: bool = Query(False, description='Incluir dados do VizieR'),
):
    '''Busca um objeto astronômico pelo nome.'''
    try:
        raw = query_single_object(name)
    except Exception:
        raise HTTPException(
            status_code=503,
            detail='Serviço SIMBAD indisponível. Tente novamente.',
        )

    if raw is None:
        raise HTTPException(
            status_code=404,
            detail=f'Objeto {name!r} não encontrado no SIMBAD.',
        )

    coords = None
    if raw.get('ra') and raw.get('dec'):
        coords = Coordinates(ra=raw['ra'], dec=raw['dec'])

    mag = None
    if raw.get('magnitude_v') is not None:
        mag = Magnitude(apparent=raw['magnitude_v'])

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
        catalogs=raw.get('catalogs', ['SIMBAD']),
    )

    return SingleResponse(
        object=obj,
        sources=['SIMBAD'],
        confidence='high',
    )


@router.get('/type', response_model=ListResponse)
async def search_by_type(
    query: str = Query(..., description='Tipo: wolf rayet, pulsar, cepheid...'),
    limit: int = Query(20, ge=1, le=100),
):
    '''Busca objetos por tipo ou classe.'''
    query_lower = query.lower().strip()
    otype_code  = None
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