from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import search

app = FastAPI(
    title='AstroQuery API',
    description='API para consulta de objetos astronômicos em múltiplos catálogos.',
    version='0.2.0',
)

ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000',
    'http://127.0.0.1:5173',
    'https://cosmic-axolotl.github.io',
    'https://cosmic-axolotl.github.io/astronomy-n-science/',
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False, 
    allow_methods=['GET', 'POST', 'OPTIONS'],
    allow_headers=['*'],
)
app.include_router(search.router)


@app.get('/', tags=['Health'])
async def root():
    '''Verifica se o servidor está online.'''
    return {
        'status':  'online',
        'name':    'AstroQuery API',
        'version': '0.2.0',
        'docs':    '/docs',
    }