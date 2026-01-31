import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Sphere, Sparkles } from '@react-three/drei'

export function Star({ position, node, isSelected, onClick }) {
    const meshRef = useRef()
    const [hovered, setHover] = useState(false)

    // Destructure node properties
    const { importance, keywords, question } = node

    // Base size on importance (1-5) -> 0.3 to 1.0
    const size = 0.3 + (importance * 0.15)

    // Color based on importance
    // High importance (4-5) = Gold/Alpha
    // Medium (3) = White/Beta
    // Low (1-2) = Blueish/Satellite
    const getColor = () => {
        if (importance >= 4) return { color: '#FFD700', emissive: '#FFA500' }
        if (importance === 3) return { color: '#FFFFFF', emissive: '#AAAAAA' }
        return { color: '#A0C4FF', emissive: '#5078AA' }
    }

    const { color, emissive } = getColor()

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.2
            // Pulse if selected or important
            if (isSelected || importance >= 4) {
                const speed = isSelected ? 3 : 1
                const scale = 1 + Math.sin(state.clock.elapsedTime * speed) * 0.05
                meshRef.current.scale.set(scale, scale, scale)
            }
        }
    })

    return (
        <group position={position} onClick={onClick}>
            <Sphere ref={meshRef} args={[size, 32, 32]}
                onPointerOver={() => setHover(true)}
                onPointerOut={() => setHover(false)}
            >
                <meshStandardMaterial
                    color={color}
                    emissive={emissive}
                    emissiveIntensity={isSelected || hovered ? 2 : 0.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>

            {/* Glow for high importance */}
            {importance >= 4 && (
                <Sparkles count={importance * 5} scale={size * 4} size={2} speed={0.4} opacity={0.5} color={color} />
            )}

            {/* Label: Keywords only */}
            {(hovered || isSelected) && (
                <Html distanceFactor={10} position={[0, size + 0.5, 0]}>
                    <div style={{
                        color: 'white',
                        background: 'rgba(0,0,0,0.8)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        border: `1px solid ${color}`,
                        textAlign: 'center',
                        minWidth: '100px'
                    }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                            {keywords && keywords.length > 0 ? keywords.join(', ') : '...'}
                        </div>
                        {isSelected && <div style={{ fontSize: '0.7rem', color: '#ccc', maxWidth: '200px', whiteSpace: 'normal' }}>{question.substring(0, 50)}...</div>}
                    </div>
                </Html>
            )}
        </group>
    )
}
