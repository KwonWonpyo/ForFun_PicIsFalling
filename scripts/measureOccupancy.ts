import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { ParticleSystem } from '../src/lib/engine/ParticleSystem'
import { estimateDownwardAcceleration } from '../src/lib/engine/occupancy'
import { snowPreset } from '../src/lib/presets/snow'
import type { Bounds, ForceConfig, PresetConfig } from '../src/lib/engine/types'
import type { Particle } from '../src/lib/engine/Particle'

interface Scenario {
  id: string
  label: string
  targetOnScreenParticles: number
  speed: number
  speedVariety: number
}

interface ScenarioResult {
  scenario: Scenario
  avgVisible: number
  minVisible: number
  maxVisible: number
  avgTotal: number
  minTotal: number
  maxTotal: number
  avgSpawnPerSecond: number
  minVisibleAfter2s: number
  occupancyRatio: number
}

const BOUNDS: Bounds = { width: 1920, height: 1080 }
const FPS = 60
const TOTAL_FRAMES = 12 * FPS
const SAMPLE_START_FRAME = 2 * FPS

const scenarios: Scenario[] = [
  {
    id: 'target500_high_speed',
    label: '기대값 500 / 고속',
    targetOnScreenParticles: 500,
    speed: 12,
    speedVariety: 3,
  },
  {
    id: 'target100_extreme_speed',
    label: '기대값 100 / 초고속',
    targetOnScreenParticles: 100,
    speed: 20,
    speedVariety: 5,
  },
  {
    id: 'target3000_high_load',
    label: '기대값 3000 / 고부하',
    targetOnScreenParticles: 3000,
    speed: 8,
    speedVariety: 2,
  },
]

function remapForces(baseForces: ForceConfig[], speed: number): ForceConfig[] {
  return baseForces.map((force) => {
    if (force.type === 'gravity') {
      return { ...force, strength: speed * 5 }
    }
    return force
  })
}

function buildPresetForScenario(scenario: Scenario): PresetConfig {
  const baseSpeed = scenario.speed * 15
  const varietyRatio = Math.min(0.95, Math.max(0, scenario.speedVariety * 0.3))
  const remapped = remapForces(snowPreset.forces, scenario.speed)

  return {
    ...snowPreset,
    emitter: {
      ...snowPreset.emitter,
      targetOnScreenParticles: scenario.targetOnScreenParticles,
      safetyCap: Math.max(
        Math.ceil(scenario.targetOnScreenParticles * 1.8),
        scenario.targetOnScreenParticles + 240,
      ),
      estimatedVerticalAcceleration: estimateDownwardAcceleration(remapped),
      initialSpeed: [
        Math.max(1, baseSpeed * (1 - varietyRatio)),
        Math.max(1, baseSpeed * (1 + varietyRatio)),
      ],
      spawnRateAuto: undefined,
      spawnRate: undefined,
      maxParticles: undefined,
    },
    forces: remapped,
  }
}

function countVisibleParticles(particles: Particle[], bounds: Bounds): number {
  let visible = 0
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    if (p.position.x < 0 || p.position.x > bounds.width) continue
    if (p.position.y < 0 || p.position.y > bounds.height) continue
    visible++
  }
  return visible
}

function simulateScenario(scenario: Scenario): ScenarioResult {
  const system = new ParticleSystem()
  system.setBounds(BOUNDS.width, BOUNDS.height)
  system.loadPreset(buildPresetForScenario(scenario))

  let sampleFrames = 0
  let visibleSum = 0
  let totalSum = 0
  let spawnSum = 0
  let minVisible = Number.POSITIVE_INFINITY
  let maxVisible = 0
  let minTotal = Number.POSITIVE_INFINITY
  let maxTotal = 0
  let minVisibleAfter2s = Number.POSITIVE_INFINITY

  for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
    system.update(1)
    const emitter = system.emitters[0]
    const total = emitter.particleCount
    const visible = countVisibleParticles(emitter.particles, BOUNDS)
    const spawnAuto = emitter.config.spawnRateAuto ?? 0

    if (frame >= SAMPLE_START_FRAME) {
      sampleFrames++
      visibleSum += visible
      totalSum += total
      spawnSum += spawnAuto
      minVisible = Math.min(minVisible, visible)
      maxVisible = Math.max(maxVisible, visible)
      minTotal = Math.min(minTotal, total)
      maxTotal = Math.max(maxTotal, total)
      minVisibleAfter2s = Math.min(minVisibleAfter2s, visible)
    }
  }

  const avgVisible = visibleSum / sampleFrames
  const avgTotal = totalSum / sampleFrames
  const avgSpawnPerSecond = (spawnSum / sampleFrames) * FPS
  return {
    scenario,
    avgVisible,
    minVisible,
    maxVisible,
    avgTotal,
    minTotal,
    maxTotal,
    avgSpawnPerSecond,
    minVisibleAfter2s,
    occupancyRatio: avgVisible / scenario.targetOnScreenParticles,
  }
}

function formatResult(result: ScenarioResult): string {
  return [
    `- ${result.scenario.label} (${result.scenario.id})`,
    `  - avgVisible: ${result.avgVisible.toFixed(1)}`,
    `  - minVisible: ${result.minVisible.toFixed(1)}`,
    `  - maxVisible: ${result.maxVisible.toFixed(1)}`,
    `  - avgTotal: ${result.avgTotal.toFixed(1)}`,
    `  - minTotal: ${result.minTotal.toFixed(1)}`,
    `  - maxTotal: ${result.maxTotal.toFixed(1)}`,
    `  - avgAutoSpawn: ${result.avgSpawnPerSecond.toFixed(1)}/s`,
    `  - minVisibleAfter2s: ${result.minVisibleAfter2s.toFixed(1)}`,
    `  - occupancyRatio(avgVisible/target): ${(result.occupancyRatio * 100).toFixed(1)}%`,
  ].join('\n')
}

function run(outputPath: string): void {
  const timestamp = new Date().toISOString()
  const results = scenarios.map(simulateScenario)
  const body = [
    'Occupancy benchmark summary',
    `generatedAt: ${timestamp}`,
    `bounds: ${BOUNDS.width}x${BOUNDS.height}`,
    `fpsAssumption: ${FPS}`,
    `sampleWindow: frame ${SAMPLE_START_FRAME}..${TOTAL_FRAMES - 1}`,
    '',
    ...results.map(formatResult),
    '',
  ].join('\n')

  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, body, 'utf8')
  process.stdout.write(body)
}

const outputPath = process.argv[2] ?? 'reports/occupancy_scenarios_summary.txt'
run(outputPath)
