import { useState, useEffect, useRef } from 'react'
import { Universe } from '../canvas/Universe'
import { useStore } from '../../store/useStore'
import { motion, AnimatePresence } from 'framer-motion'

export function MainLayout() {
    const { nodes, mode, addNode, isUniverseExpanded, toggleUniverse, setActiveNode, activeNode } = useStore()
    const [inputValue, setInputValue] = useState('')
    const chatEndRef = useRef(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!inputValue.trim()) return
        addNode(inputValue)
        setInputValue('')
    }

    // Auto-scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [nodes])

    // Init Project on Mount
    useEffect(() => {
        const init = async () => {
            if (!useStore.getState().projectId) {
                console.log("[MainLayout] Pre-initializing project...");
                await useStore.getState().initializeProject();
            }
        };
        init();
    }, []);

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#050510', color: 'white' }}>

            {/* LEFT PANEL: Chat Interface */}
            <div style={{
                width: isUniverseExpanded ? '0px' : '30%',
                minWidth: isUniverseExpanded ? '0px' : '350px',
                height: '100%',
                borderRight: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.5s ease, min-width 0.5s ease',
                overflow: 'hidden',
                background: '#1a1a2e'
            }}>
                {/* Header */}
                <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#A0C4FF' }}>Sidera Chat</h2>
                </div>

                {/* Messages List */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {nodes.map(node => (
                        <div key={node.id}
                            onClick={() => setActiveNode(node.id)}
                            style={{
                                border: activeNode === node.id ? '1px solid #FFD700' : '1px solid transparent',
                                borderRadius: '8px',
                                padding: '10px',
                                cursor: 'pointer',
                                transition: 'border 0.2s'
                            }}
                        >
                            {/* User Question */}
                            <div style={{ alignSelf: 'flex-end', background: '#2a2a40', padding: '10px 15px', borderRadius: '15px 15px 0 15px', marginBottom: '8px', marginLeft: '20px' }}>
                                <small style={{ color: '#aaa', fontSize: '0.8rem' }}>You</small>
                                <div>{node.question}</div>
                            </div>

                            {/* AI Answer */}
                            <div style={{ alignSelf: 'flex-start', background: '#16213e', padding: '10px 15px', borderRadius: '15px 15px 15px 0', borderLeft: '3px solid #FFD700', opacity: node.isPending ? 0.7 : 1 }}>
                                <small style={{ color: '#FFD700', fontSize: '0.8rem' }}>Sidera</small>
                                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                                    {node.isPending ? (
                                        <span style={{ fontStyle: 'italic', color: '#888' }}>Contemplating the stars...</span>
                                    ) : node.answer}
                                </div>
                            </div>

                            {/* Keywords */}
                            <div style={{ marginTop: '5px', display: 'flex', gap: '5px' }}>
                                {node.keywords?.map((k, i) => (
                                    <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(255,215,0,0.1)', color: '#FFD700', padding: '2px 6px', borderRadius: '4px' }}>#{k}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#1a1a2e' }}>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask the stars..."
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #333',
                                background: '#0f0f1a',
                                color: 'white'
                            }}
                        />
                    </form>
                </div>
            </div>

            {/* RIGHT PANEL: Universe Overlay */}
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>

                {/* The Universe Canvas */}
                <div style={{ width: '100%', height: '100%', cursor: isUniverseExpanded ? 'default' : 'pointer' }} onClick={() => !isUniverseExpanded && toggleUniverse()}>
                    <Universe isInteractive={isUniverseExpanded} />
                </div>

                {/* Toggle / Minimize Button */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100 }}>
                    <button onClick={toggleUniverse} style={{ padding: '8px 16px', background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid white', borderRadius: '4px', cursor: 'pointer' }}>
                        {isUniverseExpanded ? 'Minimize Universe' : 'Expand Universe'}
                    </button>
                </div>

                {/* Table of Contents (Right Sidebar when not expanded?) - Let's put it overlay for now or separate */}
                {!isUniverseExpanded && (
                    <div style={{
                        position: 'absolute',
                        top: '80px',
                        right: '20px',
                        width: '200px',
                        maxHeight: 'calc(100% - 100px)',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(5px)',
                        borderRadius: '8px',
                        padding: '15px',
                        overflowY: 'auto'
                    }}>
                        <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '5px' }}>Constellations</h3>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {nodes.filter(n => n.importance && n.importance >= 3).map(node => (
                                <li key={node.id}
                                    onClick={() => setActiveNode(node.id)}
                                    style={{
                                        marginBottom: '8px',
                                        fontSize: '0.9rem',
                                        cursor: 'pointer',
                                        color: activeNode === node.id ? '#FFD700' : '#ddd',
                                        opacity: activeNode === node.id ? 1 : 0.8
                                    }}
                                >
                                    {node.keywords?.[0] || 'Unknown Star'}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

            </div>
        </div>
    )
}
