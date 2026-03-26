import os
import requests
import logging

logger = logging.getLogger(__name__)

ADS_BASE_URL = 'https://api.adsabs.harvard.edu/v1'


def _get_token() -> str | None:
    token = os.getenv('NASA_ADS_TOKEN')
    if not token:
        logger.warning('NASA_ADS_TOKEN não configurado no .env')
    return token


def query_articles(object_name: str, limit: int = 5) -> list[dict]:
    token = _get_token()
    if not token:
        return []

    try:
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type':  'application/json',
        }

        params = {
            'q':    f'object:{object_name}',
            'sort': 'date desc',
            'fl':   'title,author,year,abstract,bibcode,doi',
            'rows': limit,
        }

        response = requests.get(
            f'{ADS_BASE_URL}/search/query',
            headers=headers,
            params=params,
            timeout=10,
        )
        response.raise_for_status()

        data = response.json()
        docs = data.get('response', {}).get('docs', [])

        return [_parse_article(doc) for doc in docs]

    except requests.exceptions.Timeout:
        logger.error('Timeout ao consultar NASA/ADS')
        return []

    except Exception as e:
        logger.error(f'Erro ao consultar NASA/ADS: {e}')
        return []


def _parse_article(doc: dict) -> dict:
    authors = doc.get('author', [])
    return {
        'title':    doc.get('title', [''])[0],
        'authors':  authors[:3],
        'et_al':    len(authors) > 3,
        'year':     doc.get('year'),
        'bibcode':  doc.get('bibcode'),
        'doi':      doc.get('doi', [None])[0],
        'abstract': doc.get('abstract', '')[:300],
        'ads_url':  f'https://ui.adsabs.harvard.edu/abs/{doc.get("bibcode")}',
    }