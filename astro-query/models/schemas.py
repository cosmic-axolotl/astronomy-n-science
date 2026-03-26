from pydantic import BaseModel, Field
from typing import Optional, List


class Coordinates(BaseModel):
    ra:    str
    dec:   str
    epoch: str = 'J2000'


class Magnitude(BaseModel):
    apparent: Optional[float] = None
    absolute: Optional[float] = None


class ObjectResult(BaseModel):
    # Identificação
    name:          str
    aliases:       List[str] = []
    object_type:   str
    constellation: Optional[str] = None

    # Posição
    coordinates: Optional[Coordinates] = None

    # Distância
    distance_ly:     Optional[float] = Field(None, description='Distância em anos-luz')
    distance_pc:     Optional[float] = Field(None, description='Distância em parsecs')
    distance_method: Optional[str]   = None

    # Propriedades físicas
    spectral_type:    Optional[str]   = None
    temperature_k:    Optional[float] = None
    mass_solar:       Optional[float] = None
    luminosity_solar: Optional[float] = None
    radius_solar:     Optional[float] = None
    age_myr:          Optional[float] = None

    # Fotometria
    magnitude: Optional[Magnitude] = None

    # Cinemática
    radial_velocity_kms: Optional[float] = None
    redshift:            Optional[float] = None

    # Catálogos
    catalogs:         List[str] = []
    notable_features: List[str] = []
    description:      Optional[str] = None


class ListItem(BaseModel):
    name:              str
    aliases:           List[str]      = []
    object_type:       str
    constellation:     Optional[str]  = None
    ra:                Optional[str]  = None
    dec:               Optional[str]  = None
    distance_ly:       Optional[float]= None
    apparent_magnitude:Optional[float]= None
    temperature_k:     Optional[float]= None
    spectral_type:     Optional[str]  = None
    mass_solar:        Optional[float]= None
    luminosity_solar:  Optional[float]= None
    age_myr:           Optional[float]= None
    redshift:          Optional[float]= None
    catalogs:          List[str]      = []
    match_score:       Optional[float]= Field(None, ge=0, le=1)
    notable:           Optional[str]  = None



class ListResponse(BaseModel):
    mode:                 str = 'list'
    query_interpretation: str
    total_estimated:      Optional[int] = None
    results:              List[ListItem]
    sources:              List[str] = []


class ErrorResponse(BaseModel):
    mode:        str = 'error'
    message:     str
    suggestions: List[str] = []

class HipparcosData(BaseModel):
    hip_id:       Optional[int]   = None
    magnitude_v:  Optional[float] = None
    color_bv:     Optional[float] = None
    parallax_mas: Optional[float] = None
    parallax_err: Optional[float] = None
    distance_ly:  Optional[float] = None
    pm_ra:        Optional[float] = None
    pm_dec:       Optional[float] = None
    catalog:      str = 'Hipparcos I/239'


class TwoMassData(BaseModel):
    two_mass_id: Optional[str]   = None
    j_mag:       Optional[float] = None
    h_mag:       Optional[float] = None
    k_mag:       Optional[float] = None
    quality:     Optional[str]   = None
    catalog:     str = '2MASS II/246'


class AdsArticle(BaseModel):
    title:    str
    authors:  List[str] = []
    et_al:    bool = False
    year:     Optional[str] = None
    bibcode:  Optional[str] = None
    doi:      Optional[str] = None
    abstract: Optional[str] = None
    ads_url:  Optional[str] = None


class Enrichments(BaseModel):
    hipparcos:    Optional[HipparcosData]    = None
    two_mass:     Optional[TwoMassData]      = None

class SingleResponse(BaseModel):
    mode:        str = 'single'
    object:      ObjectResult
    enrichments: Optional[Enrichments] = None
    sources:     List[str] = []
    confidence:  str = 'high'
    warnings:    Optional[str] = None
    ads_articles: Optional[List[AdsArticle]] = None