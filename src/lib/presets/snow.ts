import type { PresetConfig } from '../engine/types'

export const snowPreset: PresetConfig = {
  name: 'snow',
  label: '❄️ 눈',
  emitter: {
    targetOnScreenParticles: 800,
    safetyCap: 1800,
    estimatedVerticalAcceleration: 15,
    topSpawnBandHeight: 18,
    spawnArea: { type: 'line', x1: -1, y1: -20, x2: -1, y2: -20 },
    particleLifetime: [8, 16],
    initialSpeed: [20, 60],
    initialDirection: [Math.PI * 0.4, Math.PI * 0.6],
    initialSize: [2, 8],
    initialRotation: [0, Math.PI * 2],
    initialOpacity: [0.4, 1.0],
    color: 0xffffff,
    texture: 'snowflake',
  },
  forces: [
    { type: 'gravity', strength: 15 },
    { type: 'turbulence', frequency: 0.4, amplitude: 25 },
  ],
  background: {
    type: 'gradient',
    gradient: 'linear-gradient(180deg, #0a1628 0%, #1a2a4a 40%, #2c3e6b 70%, #3d5a80 100%)',
  },
}
