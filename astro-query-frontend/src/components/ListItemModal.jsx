const TYPE_COLORS = {
    galaxy: '#b06af5',
    star: '#f5a623',
    nebula: '#4af5c2',
    'wolf-rayet': '#ff6a3d',
    'wolf rayet': '#ff6a3d',
    pulsar: '#4a9fd4',
    'white dwarf': '#c8dff0',
    supergiant: '#f5a030',
    default: '#4a9fd4',
};

function typeColor(t = '') {
    const tl = t.toLowerCase();
    const key = Object.keys(TYPE_COLORS).find(k => tl.includes(k));
    return key ? TYPE_COLORS[key] : TYPE_COLORS.default;
}

function DataRow({ label, value, accent }) {
    if (value == null) return null;
    return (
        <div style={{ display: 'flex', gap: '12px', padding: '5px 0', borderBottom: '1px solid #ffffff07' }}>
            <span style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '11px', minWidth: '130px', flexShrink: 0 }}>
                {label}
            </span>
            <span style={{ color: accent || '#b8d4ea', fontFamily: 'monospace', fontSize: '11px' }}>
                {value}
            </span>
        </div>
    );
}

export default function ListItemModal({ obj, onClose }) {
    if (!obj) return null;
    const color = typeColor(obj.object_type);

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    zIndex: 100,
                    backdropFilter: 'blur(2px)',
                }}
            />

            <div style={{
                position: 'fixed',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 'min(90vw, 680px)',
                maxHeight: '80vh',
                overflowY: 'auto',
                background: '#050d18',
                border: '1px solid #1a3050',
                borderLeft: `3px solid ${color}`,
                borderRadius: '6px',
                padding: '28px',
                zIndex: 101,
            }}>

                <div style={{
                    position: 'absolute', top: 0, right: 0,
                    width: '160px', height: '160px',
                    background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '16px', right: '16px',
                        background: 'transparent', border: '1px solid #1a3a5a',
                        color: '#2a5a7a', fontFamily: 'monospace', fontSize: '11px',
                        padding: '3px 10px', borderRadius: '2px', cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.target.style.color = '#4a9fd4'; e.target.style.borderColor = '#2a6a9a'; }}
                    onMouseLeave={e => { e.target.style.color = '#2a5a7a'; e.target.style.borderColor = '#1a3a5a'; }}
                >
                    ✕ FECHAR
                </button>

                <div style={{ marginBottom: '20px', paddingRight: '80px' }}>
                    <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '24px', color: '#e8f4ff' }}>
                        {obj.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                            color: color, border: `1px solid ${color}44`,
                            padding: '2px 10px', fontFamily: 'monospace',
                            fontSize: '10px', borderRadius: '2px',
                        }}>
                            {obj.object_type}
                        </span>
                        {obj.constellation && (
                            <span style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px' }}>
                                {obj.constellation}
                            </span>
                        )}
                    </div>
                    {obj.aliases?.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                            {obj.aliases.slice(0, 4).map((a, i) => (
                                <span key={i} style={{ color: '#1a3a5a', fontFamily: 'monospace', fontSize: '10px' }}>
                                    {a}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
                    <div>
                        <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>
                            ⊕ COORDENADAS
                        </div>
                        <DataRow label="RA" value={obj.ra} accent="#7ad4f5" />
                        <DataRow label="Dec" value={obj.dec} accent="#7ad4f5" />
                        <DataRow label="Distância" value={obj.distance_ly ? `${obj.distance_ly.toLocaleString()} ly` : null} accent="#f5c542" />
                    </div>
                    <div>
                        <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>
                            ◈ FÍSICO
                        </div>
                        <DataRow label="Tipo Espectral" value={obj.spectral_type} accent="#b06af5" />
                        <DataRow label="Temperatura" value={obj.temperature_k ? `${obj.temperature_k.toLocaleString()} K` : null} accent="#f57a4a" />
                        <DataRow label="Magnitude ap." value={obj.apparent_magnitude?.toFixed(3)} accent="#c8f542" />
                        <DataRow label="Massa" value={obj.mass_solar ? `${obj.mass_solar} M☉` : null} />
                        <DataRow label="Luminosidade" value={obj.luminosity_solar ? `${obj.luminosity_solar.toLocaleString()} L☉` : null} />
                        <DataRow label="Redshift" value={obj.redshift?.toFixed(6)} />
                    </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ color: '#1a3a5a', fontFamily: 'monospace', fontSize: '10px' }}>CATALOGS:</span>
                    {obj.catalogs?.map(c => (
                        <span key={c} style={{
                            color: '#2a5a7a', border: '1px solid #1a3a5a',
                            padding: '1px 8px', fontFamily: 'monospace',
                            fontSize: '9px', borderRadius: '2px',
                        }}>
                            {c}
                        </span>
                    ))}
                </div>

                <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #0e2035' }}>

                    <a href={`https://simbad.u-strasbg.fr/simbad/sim-id?Ident=${encodeURIComponent(obj.name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#2a6a9a', fontFamily: 'monospace', fontSize: '10px', textDecoration: 'none', letterSpacing: '0.1em' }}
                    >
                        → ABRIR NO SIMBAD
                    </a>
                </div>

            </div >
        </>
    );
}