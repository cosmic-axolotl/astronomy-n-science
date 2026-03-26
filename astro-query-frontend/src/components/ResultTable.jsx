const TYPE_COLORS = {
    galaxy: '#b06af5',
    star: '#f5a623',
    nebula: '#4af5c2',
    'wolf-rayet': '#ff6a3d',
    'wolf rayet': '#ff6a3d',
    pulsar: '#4a9fd4',
    default: '#4a9fd4',
};

function typeColor(t = '') {
    const tl = t.toLowerCase();
    const key = Object.keys(TYPE_COLORS).find(k => tl.includes(k));
    return key ? TYPE_COLORS[key] : TYPE_COLORS.default;
}

export default function ResultTable({ results }) {
    if (!results?.length) return null;

    return (
        <div style={{ overflowX: 'auto', marginTop: '4px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '11px' }}>
                <thead>
                    <tr>
                        {['NOME', 'TIPO', 'CONSTELAÇÃO', 'MAG', 'DIST (ly)', 'TEMP (K)', 'ESPECTRAL', 'MATCH'].map(col => (
                            <th key={col} style={{
                                textAlign: 'left', padding: '6px 10px',
                                color: '#1a4a6a', fontWeight: 'normal',
                                letterSpacing: '0.12em', borderBottom: '1px solid #0e2535',
                                whiteSpace: 'nowrap',
                            }}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.map((obj, i) => {
                        const color = typeColor(obj.object_type);
                        return (
                            <tr
                                key={i}
                                style={{ borderBottom: '1px solid #0a1e2e', transition: 'background 0.15s', cursor: 'default' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#04090f'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '8px 10px', color: '#c8dff0', borderLeft: `2px solid ${color}` }}>
                                    {obj.name}
                                </td>
                                <td style={{ padding: '8px 10px', color: color, whiteSpace: 'nowrap' }}>
                                    {obj.object_type}
                                </td>
                                <td style={{ padding: '8px 10px', color: '#4a7a9a' }}>
                                    {obj.constellation ?? '—'}
                                </td>
                                <td style={{ padding: '8px 10px', color: '#c8f542', textAlign: 'right' }}>
                                    {obj.apparent_magnitude ?? '—'}
                                </td>
                                <td style={{ padding: '8px 10px', color: '#f5c542', textAlign: 'right' }}>
                                    {obj.distance_ly?.toLocaleString() ?? '—'}
                                </td>
                                <td style={{ padding: '8px 10px', color: '#f57a4a', textAlign: 'right' }}>
                                    {obj.temperature_k?.toLocaleString() ?? '—'}
                                </td>
                                <td style={{ padding: '8px 10px', color: '#b06af5' }}>
                                    {obj.spectral_type ?? '—'}
                                </td>
                                <td style={{ padding: '8px 10px', color: '#4af5a0', textAlign: 'right' }}>
                                    {obj.match_score != null ? `${Math.round(obj.match_score * 100)}%` : '—'}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}