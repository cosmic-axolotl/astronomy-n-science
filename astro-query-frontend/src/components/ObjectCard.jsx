import EnrichmentPanel from './EnrichmentPanel';

const TYPE_COLORS = {
    galaxy: '#b06af5',
    star: '#f5a623',
    nebula: '#4af5c2',
    cluster: '#f54a8a',
    pulsar: '#4a9fd4',
    'wolf-rayet': '#ff6a3d',
    'wolf rayet': '#ff6a3d',
    exoplanet: '#4af5c2',
    'white dwarf': '#c8dff0',
    supergiant: '#f5a030',
    variable: '#f5e642',
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

export default function ObjectCard({ data }) {
    const obj = data.object;
    const color = typeColor(obj.object_type);

    return (
        <div style={{
            background: '#050d18',
            border: `1px solid #1a3050`,
            borderLeft: `3px solid ${color}`,
            borderRadius: '4px',
            padding: '24px',
            marginTop: '20px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Glow */}
            <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '160px', height: '160px',
                background: `radial-gradient(circle at top right, ${color}15, transparent 70%)`,
                pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '26px', color: '#e8f4ff' }}>
                            {obj.name}
                        </h2>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '5px', flexWrap: 'wrap' }}>
                            {obj.aliases?.slice(0, 4).map((a, i) => (
                                <span key={i} style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '11px' }}>{a}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                        <span style={{
                            color: color, border: `1px solid ${color}44`,
                            padding: '2px 10px', fontFamily: 'monospace',
                            fontSize: '10px', borderRadius: '2px',
                        }}>{obj.object_type}</span>
                        {data.confidence && (
                            <span style={{
                                color: '#4af5a0', border: '1px solid #4af5a044',
                                padding: '2px 10px', fontFamily: 'monospace',
                                fontSize: '10px', borderRadius: '2px',
                            }}>{data.confidence}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Data grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
                <div>
                    <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>
                        ⊕ COORDENADAS
                    </div>
                    <DataRow label="RA" value={obj.coordinates?.ra} accent="#7ad4f5" />
                    <DataRow label="Dec" value={obj.coordinates?.dec} accent="#7ad4f5" />
                    <DataRow label="Distância" value={obj.distance_ly ? `${obj.distance_ly} ly` : null} accent="#f5c542" />
                    <DataRow label="Distância" value={obj.distance_pc ? `${obj.distance_pc} pc` : null} />
                </div>
                <div>
                    <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.15em', marginBottom: '8px' }}>
                        ◈ FÍSICO
                    </div>
                    <DataRow label="Tipo Espectral" value={obj.spectral_type} accent="#b06af5" />
                    <DataRow label="Temperatura" value={obj.temperature_k ? `${obj.temperature_k} K` : null} accent="#f57a4a" />
                    <DataRow label="Massa" value={obj.mass_solar ? `${obj.mass_solar} M☉` : null} />
                    <DataRow label="Luminosidade" value={obj.luminosity_solar ? `${obj.luminosity_solar} L☉` : null} />
                    <DataRow label="Magnitude ap." value={obj.magnitude?.apparent?.toFixed(3)} accent="#c8f542" />
                    <DataRow label="Vel. Radial" value={obj.radial_velocity_kms ? `${obj.radial_velocity_kms.toFixed(2)} km/s` : null} />
                    <DataRow label="Redshift" value={obj.redshift?.toFixed(6)} />
                </div>
            </div>

            {/* Sources */}
            <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#1a3a5a', fontFamily: 'monospace', fontSize: '10px' }}>SOURCES:</span>
                {data.sources?.map(s => (
                    <span key={s} style={{
                        color: '#2a5a7a', border: '1px solid #1a3a5a',
                        padding: '1px 8px', fontFamily: 'monospace',
                        fontSize: '9px', borderRadius: '2px',
                    }}>{s}</span>
                ))}
            </div>

            {/* Enrichments */}
            <EnrichmentPanel enrichments={data.enrichments} />
        </div>
    );
}