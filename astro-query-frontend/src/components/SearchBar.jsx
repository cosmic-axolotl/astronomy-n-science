const CATALOGS = [
    { id: 'hipparcos', label: 'Hipparcos', color: '#f5a623' },
    { id: 'twoMass', label: '2MASS', color: '#4af5c2' },
    { id: 'ads', label: 'NASA/ADS', color: '#b06af5' },
];

const EXAMPLES = [
    { label: 'Betelgeuse', q: '* alf Ori' },
    { label: 'Andrômeda', q: 'M31' },
    { label: 'Wolf-Rayet', q: 'wolf rayet' },
    { label: 'Cefeidas', q: 'cepheid' },
    { label: 'Pulsares', q: 'pulsar' },
    { label: 'Anãs Brancas', q: 'white dwarf' },
];

export default function SearchBar({ query, setQuery, options, setOptions, onSearch, loading, limit, setLimit }) {
    const toggleOption = (id) => {
        setOptions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div style={{ position: 'relative', zIndex: 1 }}>

            {/* Input */}
            <div style={{
                background: '#030810',
                border: '1px solid #142538',
                borderRadius: '4px',
                padding: '4px',
                display: 'flex',
                gap: '4px',
                boxShadow: '0 0 50px #04101e',
            }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px' }}>
                    <span style={{ color: '#1a4a6a', fontSize: '15px' }}>⊕</span>
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && onSearch()}
                        placeholder='Nome ou classe: "* alf Ori", "M31", "wolf rayet"...'
                        style={{
                            flex: 1, background: 'transparent', border: 'none',
                            outline: 'none', color: '#c8dff0',
                            fontFamily: 'monospace', fontSize: '14px',
                        }}
                    />
                </div>
                <button
                    onClick={onSearch}
                    disabled={loading}
                    style={{
                        padding: '10px 22px',
                        background: loading ? '#040c18' : 'linear-gradient(135deg,#08304a,#062540)',
                        border: '1px solid #1a4a7a', borderRadius: '3px',
                        color: loading ? '#1a3a5a' : '#4a9fd4',
                        fontFamily: 'monospace', fontSize: '11px',
                        letterSpacing: '0.18em', cursor: loading ? 'not-allowed' : 'pointer',
                        textTransform: 'uppercase', transition: 'all 0.2s',
                    }}
                >{loading ? 'QUERYING…' : 'QUERY'}</button>
            </div>

            {/* Catalog toggles */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>

                {/* Base — fixo */}
                <span style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em' }}>
                    BASE:
                </span>
                {['SIMBAD', 'VizieR'].map(src => (
                    <span key={src} style={{
                        padding: '3px 12px', borderRadius: '2px',
                        fontFamily: 'monospace', fontSize: '10px',
                        border: '1px solid #2a7ab044',
                        color: '#4a9fd4',
                        letterSpacing: '0.08em',
                    }}>{src}</span>
                ))}

                <span style={{ color: '#0e2535', fontFamily: 'monospace', fontSize: '10px', margin: '0 4px' }}>|</span>

                {/* Enrich — toggles */}
                <span style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em' }}>
                    ENRICH:
                </span>
                {CATALOGS.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => toggleOption(cat.id)}
                        style={{
                            padding: '3px 12px', borderRadius: '2px',
                            fontFamily: 'monospace', fontSize: '10px',
                            letterSpacing: '0.08em', cursor: 'pointer',
                            border: '1px solid',
                            background: options[cat.id] ? `${cat.color}18` : 'transparent',
                            borderColor: options[cat.id] ? cat.color : '#1a3a5a',
                            color: options[cat.id] ? cat.color : '#2a5a7a',
                            transition: 'all 0.15s',
                        }}
                    >{cat.label}</button>
                ))}

                <span style={{ color: '#0e2535', fontFamily: 'monospace', fontSize: '10px', margin: '0 4px' }}>|</span>

                {/* Limite */}
                <span style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em' }}>
                    LIMITE:
                </span>
                {[20, 50, 100].map(n => (
                    <button
                        key={n}
                        onClick={() => setLimit(n)}
                        style={{
                            padding: '3px 12px', borderRadius: '2px',
                            fontFamily: 'monospace', fontSize: '10px',
                            letterSpacing: '0.08em', cursor: 'pointer',
                            border: '1px solid',
                            background: limit === n ? '#0a2535' : 'transparent',
                            borderColor: limit === n ? '#2a7ab0' : '#1a3a5a',
                            color: limit === n ? '#4a9fd4' : '#2a5a7a',
                            transition: 'all 0.15s',
                        }}
                    >{n}</button>
                ))}
            </div>

            {/* Examples */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ color: '#0e2a40', fontFamily: 'monospace', fontSize: '10px' }}>TRY:</span>
                {EXAMPLES.map(ex => (
                    <button
                        key={ex.q}
                        onClick={() => { setQuery(ex.q); onSearch(ex.q); }}
                        style={{
                            background: 'transparent', border: '1px solid #0a1e30',
                            borderRadius: '2px', color: '#1e4a6a',
                            fontFamily: 'monospace', fontSize: '10px',
                            cursor: 'pointer', padding: '2px 10px', transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.target.style.color = '#3a7aaa'; e.target.style.borderColor = '#163050'; }}
                        onMouseLeave={e => { e.target.style.color = '#1e4a6a'; e.target.style.borderColor = '#0a1e30'; }}
                    >{ex.label}</button>
                ))}
            </div>

        </div>
    );
}