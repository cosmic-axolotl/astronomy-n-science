import { useState } from 'react';
import ListItemModal from './ListItemModal';

const CLUSTER_TYPES = {
    'OpC': 'Aglomerado Aberto',
    'GlC': 'Aglomerado Globular',
    'Cl*': 'Aglomerado Estelar',
    'As*': 'Associação Estelar',
};

function typeLabel(t = '') {
    return CLUSTER_TYPES[t] || t;
}

function MemberCard({ obj, onClick, selected }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: selected ? '#06101c' : '#040b14',
                border: `1px solid ${selected ? '#1e4a7a' : '#0e2540'}`,
                borderLeft: '3px solid #4a9fd4',
                borderRadius: '4px',
                padding: '10px 14px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#05101a'; }}
            onMouseLeave={e => { e.currentTarget.style.background = selected ? '#06101c' : '#040b14'; }}
        >
            <div>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '13px', color: '#d8eeff' }}>
                    {obj.name}
                </div>
                <div style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '9px', marginTop: '2px' }}>
                    {obj.object_type} {obj.spectral_type ? `· ${obj.spectral_type}` : ''}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', textAlign: 'right', flexShrink: 0 }}>
                {obj.apparent_magnitude != null && (
                    <div>
                        <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '8px' }}>MAG</div>
                        <div style={{ color: '#c8f542', fontFamily: 'monospace', fontSize: '11px' }}>
                            {obj.apparent_magnitude}
                        </div>
                    </div>
                )}
                {obj.distance_ly != null && (
                    <div>
                        <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '8px' }}>DIST</div>
                        <div style={{ color: '#f5c542', fontFamily: 'monospace', fontSize: '11px' }}>
                            {obj.distance_ly > 1000
                                ? `${(obj.distance_ly / 1000).toFixed(1)}k`
                                : obj.distance_ly} ly
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ClusterCard({ data }) {
    const [selectedMember, setSelectedMember] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const cluster = data.cluster;
    const members = data.members ?? [];
    const displayed = showAll ? members : members.slice(0, 20);

    return (
        <div style={{
            background: '#050d18',
            border: '1px solid #1a3050',
            borderLeft: '3px solid #4af5c2',
            borderRadius: '4px',
            padding: '24px',
            marginTop: '20px',
        }}>

            {/* Glow */}
            <div style={{
                position: 'absolute', top: 0, right: 0,
                width: '160px', height: '160px',
                background: 'radial-gradient(circle at top right, #4af5c218, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Header do aglomerado */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '24px', color: '#e8f4ff' }}>
                            {cluster.name}
                        </h2>
                        {cluster.aliases?.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                                {cluster.aliases.slice(0, 4).map((a, i) => (
                                    <span key={i} style={{ color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px' }}>{a}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <span style={{
                            color: '#4af5c2', border: '1px solid #4af5c244',
                            padding: '2px 10px', fontFamily: 'monospace',
                            fontSize: '10px', borderRadius: '2px',
                        }}>
                            {typeLabel(cluster.object_type)}
                        </span>
                    </div>
                </div>

                {/* Dados do aglomerado */}
                <div style={{ display: 'flex', gap: '24px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {cluster.coordinates && (
                        <div>
                            <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.15em', marginBottom: '3px' }}>
                                COORDENADAS
                            </div>
                            <div style={{ color: '#7ad4f5', fontFamily: 'monospace', fontSize: '11px' }}>
                                RA {cluster.coordinates.ra} · Dec {cluster.coordinates.dec}
                            </div>
                        </div>
                    )}
                    {cluster.distance_ly && (
                        <div>
                            <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.15em', marginBottom: '3px' }}>
                                DISTÂNCIA
                            </div>
                            <div style={{ color: '#f5c542', fontFamily: 'monospace', fontSize: '11px' }}>
                                {cluster.distance_ly.toLocaleString()} ly · {cluster.distance_pc?.toLocaleString()} pc
                            </div>
                        </div>
                    )}
                    <div>
                        <div style={{ color: '#1a4a6a', fontFamily: 'monospace', fontSize: '9px', letterSpacing: '0.15em', marginBottom: '3px' }}>
                            MEMBROS
                        </div>
                        <div style={{ color: '#4af5a0', fontFamily: 'monospace', fontSize: '11px' }}>
                            {data.total_members} encontrados
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de membros */}
            {members.length > 0 ? (
                <div>
                    <div style={{
                        color: '#1a4a6a', fontFamily: 'monospace', fontSize: '10px',
                        letterSpacing: '0.15em', marginBottom: '10px',
                    }}>
                        ★ MEMBROS CATALOGADOS — clique para ver detalhes
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {displayed.map((obj, i) => (
                            <MemberCard
                                key={i}
                                obj={obj}
                                selected={selectedMember?.name === obj.name}
                                onClick={() => setSelectedMember(
                                    selectedMember?.name === obj.name ? null : obj
                                )}
                            />
                        ))}
                    </div>

                    {/* Ver mais */}
                    {members.length > 20 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            style={{
                                marginTop: '12px', width: '100%',
                                background: 'transparent', border: '1px solid #0e2535',
                                color: '#2a5a7a', fontFamily: 'monospace', fontSize: '10px',
                                padding: '8px', borderRadius: '3px', cursor: 'pointer',
                                letterSpacing: '0.15em', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.target.style.borderColor = '#1a4a6a'; e.target.style.color = '#4a9fd4'; }}
                            onMouseLeave={e => { e.target.style.borderColor = '#0e2535'; e.target.style.color = '#2a5a7a'; }}
                        >
                            {showAll ? '▲ MOSTRAR MENOS' : `▼ VER TODOS (${members.length})`}
                        </button>
                    )}
                </div>
            ) : (
                <div style={{ color: '#1a3a5a', fontFamily: 'monospace', fontSize: '11px', fontStyle: 'italic' }}>
                    Nenhum membro catalogado encontrado no SIMBAD.
                </div>
            )}

            {/* Modal do membro */}
            {selectedMember && (
                <ListItemModal
                    obj={selectedMember}
                    onClose={() => setSelectedMember(null)}
                />
            )}
        </div>
    );
}