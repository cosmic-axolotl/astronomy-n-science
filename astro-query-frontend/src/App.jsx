import { useState, useCallback } from 'react';
import StarField from './components/StarField';
import SearchBar from './components/SearchBar';
import ObjectCard from './components/ObjectCard';
import ResultTable from './components/ResultTable';
import ClusterCard from './components/ClusterCard';
import ListItemModal from './components/ListItemModal';
import { searchObject, searchByType, searchCluster } from './api';

export default function App() {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState({ hipparcos: true, twoMass: true, ads: false });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('cards');
  const [selectedObj, setSelectedObj] = useState(null);
  const [limit, setLimit] = useState(20);

  const handleSearch = useCallback(async (q) => {
    const term = (q ?? query).trim();
    if (!term) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const classKeywords = [
        'wolf rayet', 'pulsar', 'cepheid', 'white dwarf', 'galaxy',
        'quasar', 'neutron star', 'supergiant', 'red giant', 'brown dwarf',
        'planetary nebula', 'supernova', 'black hole', 'agn', 'rr lyrae',
      ];

      const clusterKeywords = [
        'cluster', 'aglomerado', 'pleiades', 'hyades', 'praesepe',
        'omega centauri', 'globular', 'open cluster',
      ];

      const isClusterQuery = clusterKeywords.some(kw => term.toLowerCase().includes(kw));
      const isClassQuery = classKeywords.some(kw => term.toLowerCase().includes(kw)) && !isClusterQuery;

      if (isClusterQuery) {
        const data = await searchCluster(term, limit);
        setResult({ mode: 'cluster', ...data });
      } else if (isClassQuery) {
        const data = await searchByType(term, limit);
        setResult({ mode: 'list', ...data });
      } else {
        const data = await searchObject(term, options);
        setResult({ mode: 'single', ...data });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setError(`Objeto "${term}" não encontrado.`);
      } else if (err.response?.status === 422) {
        setError(`Tipo "${term}" não reconhecido. Tente: wolf rayet, pulsar, cepheid...`);
      } else {
        setError('Erro ao conectar ao servidor. Verifique se o backend está rodando.');
      }
    } finally {
      setLoading(false);
    }
  }, [query, options, limit]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <StarField />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '960px', margin: '0 auto', padding: '36px 18px 60px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ color: '#0e2a4a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.35em', marginBottom: '10px' }}>
            ◈ ASTRONOMICAL OBJECT DATABASE ◈
          </div>
          <h1 style={{
            margin: 0, fontSize: 'clamp(26px, 6vw, 50px)',
            fontFamily: 'Georgia, serif',
            background: 'linear-gradient(135deg, #a8d4f5 0%, #4a9fd4 45%, #9a6af5 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '0.06em',
          }}>AstroQuery</h1>
          <p style={{ color: '#1a3a5a', fontFamily: 'monospace', fontSize: '11px', marginTop: '6px', letterSpacing: '0.12em' }}>
            SIMBAD · VizieR · Hipparcos · 2MASS · NASA/ADS
          </p>
        </div>

        {/* Search */}
        <SearchBar
          query={query}
          setQuery={setQuery}
          options={options}
          setOptions={setOptions}
          onSearch={handleSearch}
          loading={loading}
          limit={limit}
          setLimit={setLimit}
        />

        {/* Loading */}
        {loading && (
          <div style={{
            marginTop: '28px', padding: '36px',
            border: '1px solid #0a1e30', borderRadius: '4px',
            background: '#020810', textAlign: 'center',
          }}>
            <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '12px', letterSpacing: '0.2em' }}>
              QUERYING CATALOGS…
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '20px', padding: '20px',
            border: '1px solid #3a1010', borderRadius: '4px',
            background: '#080404',
          }}>
            <div style={{ color: '#b04040', fontFamily: 'monospace', fontSize: '12px' }}>
              ✗ {error}
            </div>
          </div>
        )}

        {/* Single result */}
        {result?.mode === 'single' && (
          <ObjectCard data={result} />
        )}

        {/* Cluster result */}
        {result?.mode === 'cluster' && (
          <ClusterCard data={result} />
        )}

        {/* List result */}
        {result?.mode === 'list' && (
          <>
            <div style={{
              marginTop: '20px', padding: '8px 14px',
              background: '#030a14', border: '1px solid #0e2030', borderRadius: '3px',
            }}>
              <span style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '11px' }}>
                QUERY: <span style={{ color: '#4a8ab0' }}>{result.query_interpretation}</span>
              </span>
            </div>

            {/* View toggle */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '12px' }}>
              {[['cards', '⊞ CARDS'], ['table', '≡ TABLE']].map(([v, l]) => (
                <button key={v} onClick={() => setView(v)}
                  style={{
                    padding: '4px 12px', fontFamily: 'monospace', fontSize: '10px',
                    border: '1px solid', borderRadius: '2px', cursor: 'pointer',
                    background: view === v ? '#0a2535' : 'transparent',
                    borderColor: view === v ? '#2a7ab0' : '#0e2a3a',
                    color: view === v ? '#4a9fd4' : '#2a5a7a',
                    transition: 'all 0.15s',
                  }}
                >{l}</button>
              ))}
            </div>

            {/* Cards */}
            {view === 'cards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {result.results?.map((obj, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedObj(selectedObj?.name === obj.name ? null : obj)}
                    style={{
                      background: selectedObj?.name === obj.name ? '#06101c' : '#040b14',
                      border: `1px solid ${selectedObj?.name === obj.name ? '#1e4a7a' : '#0e2540'}`,
                      borderLeft: '3px solid #4a9fd4',
                      borderRadius: '4px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#05101a'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedObj?.name === obj.name ? '#06101c' : '#040b14'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span style={{ fontFamily: 'Georgia, serif', fontSize: '16px', color: '#d8eeff' }}>
                          {obj.name}
                        </span>
                        <div style={{ color: '#4a9fd4', fontFamily: 'monospace', fontSize: '10px', marginTop: '4px' }}>
                          {obj.object_type}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '14px', textAlign: 'right' }}>
                        {obj.apparent_magnitude != null && (
                          <div>
                            <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '9px' }}>MAG</div>
                            <div style={{ color: '#c8f542', fontFamily: 'monospace', fontSize: '13px' }}>{obj.apparent_magnitude}</div>
                          </div>
                        )}
                        {obj.spectral_type && (
                          <div>
                            <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '9px' }}>SPECTRAL</div>
                            <div style={{ color: '#b06af5', fontFamily: 'monospace', fontSize: '13px' }}>{obj.spectral_type}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    {obj.notable && (
                      <div style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px', marginTop: '6px', fontStyle: 'italic' }}>
                        {obj.notable}
                      </div>
                    )}
                    <div style={{ marginTop: '6px', color: '#1a4a6a', fontFamily: 'monospace', fontSize: '9px' }}>
                      clique para ver detalhes →
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal */}
            {selectedObj && (
              <ListItemModal
                obj={selectedObj}
                onClose={() => setSelectedObj(null)}
              />
            )}

            {/* Table */}
            {view === 'table' && <ResultTable results={result.results} />}
          </>
        )}
      </div>
    </div>
  );
}