function Section({ title, children }) {
    return (
        <div style={{ marginTop: '16px' }}>
            <div style={{
                color: '#1a4a6a', fontFamily: 'monospace', fontSize: '10px',
                letterSpacing: '0.15em', marginBottom: '8px', textTransform: 'uppercase',
            }}>{title}</div>
            {children}
        </div>
    );
}

function Row({ label, value, accent }) {
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

function HipparcosPanel({ data }) {
    if (!data) return null;
    return (
        <Section title="⊕ Hipparcos I/239">
            <Row label="HIP ID" value={data.hip_id ? `HIP ${data.hip_id}` : null} accent="#f5a623" />
            <Row label="Paralaxe" value={data.parallax_mas ? `${data.parallax_mas.toFixed(2)} ± ${data.parallax_err?.toFixed(2) ?? '?'} mas` : null} />
            <Row label="Distância" value={data.distance_ly ? `${data.distance_ly} ly` : null} accent="#f5c542" />
            <Row label="Magnitude V" value={data.magnitude_v?.toFixed(3)} accent="#c8f542" />
            <Row label="Cor B-V" value={data.color_bv?.toFixed(3)} />
            <Row label="Mov. Próprio" value={data.pm_ra ? `RA ${data.pm_ra?.toFixed(2)}, Dec ${data.pm_dec?.toFixed(2)} mas/yr` : null} />
        </Section>
    );
}

function TwoMassPanel({ data }) {
    if (!data) return null;
    return (
        <Section title="◈ 2MASS II/246">
            <Row label="ID 2MASS" value={data.two_mass_id} accent="#4af5c2" />
            <Row label="J (1.25µm)" value={data.j_mag?.toFixed(3)} />
            <Row label="H (1.65µm)" value={data.h_mag?.toFixed(3)} />
            <Row label="K (2.17µm)" value={data.k_mag?.toFixed(3)} />
            <Row label="Qualidade" value={data.quality} accent={data.quality === 'AAA' ? '#4af5a0' : '#f5c542'} />
        </Section>
    );
}

function AdsPanel({ articles }) {
    if (!articles?.length) return null;
    return (
        <Section title="≋ NASA/ADS — Artigos Recentes">
            {articles.map((art, i) => (
                <a
                    key={i}
                    href={art.ads_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'block',
                        padding: '10px 12px',
                        marginBottom: '6px',
                        border: '1px solid #0e2535',
                        borderRadius: '3px',
                        background: '#040a12',
                        textDecoration: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2a6a9a'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#0e2535'}
                >
                    <div style={{ color: '#7ab8d8', fontFamily: 'monospace', fontSize: '11px', marginBottom: '4px' }}>
                        {art.title}
                    </div>
                    <div style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px' }}>
                        {art.authors?.join(', ')}{art.et_al ? ' et al.' : ''} · {art.year}
                    </div>
                    {art.abstract && (
                        <div style={{ color: '#1a3a5a', fontFamily: 'monospace', fontSize: '9px', marginTop: '4px', lineHeight: '1.5' }}>
                            {art.abstract}...
                        </div>
                    )}
                </a>
            ))}
        </Section>
    );
}

export default function EnrichmentPanel({ enrichments }) {
    if (!enrichments) return null;
    const { hipparcos, two_mass, ads_articles } = enrichments;
    if (!hipparcos && !two_mass && !ads_articles?.length) return null;

    return (
        <div style={{
            marginTop: '16px', paddingTop: '16px',
            borderTop: '1px solid #0e2035',
        }}>
            <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em' }}>
                ▦ ENRIQUECIMENTOS
            </div>
            <HipparcosPanel data={hipparcos} />
            <TwoMassPanel data={two_mass} />
            <AdsPanel articles={ads_articles} />
        </div>
    );
}