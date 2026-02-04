import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Sphere, MeshDistortMaterial, Html } from '@react-three/drei'
import * as THREE from 'three'
import clsx from 'clsx'

// Reusing the improved BackgroundStar logic
function Star({ position, importance }) {
  const size = 0.08 + (importance ?? 2) * 0.03

  // Config based on importance (Same as Universe.jsx)
  const config = importance >= 5 ? { color: '#FFD700', emissive: '#FFaa00', distort: 0.4, speed: 2 } :
    importance >= 4 ? { color: '#00FFFF', emissive: '#0088FF', distort: 0.3, speed: 1.5 } :
      { color: '#5566AA', emissive: '#223355', distort: 0, speed: 0 }

  return (
    <group position={position}>
      {config.distort > 0 ? (
        <Sphere args={[size, 16, 16]}>
          <MeshDistortMaterial
            color={config.color}
            emissive={config.emissive}
            emissiveIntensity={2}
            roughness={0.1}
            metalness={0.8}
            distort={config.distort}
            speed={config.speed}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ) : (
        <mesh>
          <sphereGeometry args={[size, 8, 8]} />
          <meshStandardMaterial
            color={config.color}
            emissive={config.emissive}
            emissiveIntensity={1}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  )
}

function Edge({ start, end, type }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])
  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  const color = type === 'explicit' ? '#336688' : '#223344'
  const opacity = type === 'explicit' ? 0.35 : 0.15

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} />
    </line>
  )
}

export function InteractiveConstellation({
  constellation,
  offset,
  isHovered,
  isFocused,
  onHover,
  onClick
}) {
  const groupRef = useRef()
  const { nodes, edges, constellationName, projectId, title } = constellation

  // ... existing code below (line 73+)

  // Base scale
  const baseScale = 0.6
  const targetScale = isFocused ? 0.8 : (isHovered ? 0.7 : 0.6)

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Smooth scale transition
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 4)

      // Gentle rotation if not focused
      if (!isFocused) {
        groupRef.current.rotation.y += delta * 0.05
      }
    }
  })

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id.toString(), n])), [nodes])

  // Local position helper (relative to group 0,0,0)
  const getPosition = (pos) => {
    if (!pos) return [0, 0, 0]
    const x = Array.isArray(pos) ? pos[0] : (pos.x ?? 0)
    const y = Array.isArray(pos) ? pos[1] : (pos.y ?? 0)
    const z = Array.isArray(pos) ? pos[2] : (pos.z ?? 0)
    return [x, y, z] // No offset applied here, offset is on the group
  }

  return (
    <group
      ref={groupRef}
      position={offset}
      onClick={(e) => {
        e.stopPropagation()
        onClick({ projectId, position: offset })
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(projectId)
      }}
      onPointerOut={(e) => {
        onHover(null)
      }}
    >
      {/* Hit Area Sphere (Invisible but captures events) */}
      <mesh visible={false}>
        <sphereGeometry args={[15, 16, 16]} />
        <meshBasicMaterial />
      </mesh>

      {/* Render Edges */}
      {edges.map((edge, i) => {
        const sourceNode = nodeMap.get(edge.source?.toString())
        const targetNode = nodeMap.get(edge.target?.toString())
        if (!sourceNode || !targetNode) return null
        return (
          <Edge
            key={`e-${i}`}
            start={getPosition(sourceNode.position)}
            end={getPosition(targetNode.position)}
            type={edge.type}
          />
        )
      })}

      {/* Render Stars */}
      {nodes.map((node, i) => (
        <Star
          key={`n-${i}`}
          position={getPosition(node.position)}
          importance={node.importance}
        />
      ))}

      {/* Label (Only when hovered or focused) */}
      {(isHovered || isFocused) && (
        <Html position={[0, -5, 0]} center style={{ pointerEvents: 'none' }}>
          <div className={clsx(
            "px-4 py-2 rounded-full border backdrop-blur-md text-sm font-medium whitespace-nowrap transition-all duration-300",
            isFocused
              ? "bg-purple-900/80 border-purple-400 text-purple-100 shadow-[0_0_20px_rgba(168,85,247,0.5)] scale-110"
              : "bg-black/80 border-white/20 text-gray-200"
          )}>
            {title || constellationName || "Untitled Star Map"}
          </div>
        </Html>
      )}
    </group>
  )
}
