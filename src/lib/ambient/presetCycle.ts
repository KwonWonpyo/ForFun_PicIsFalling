import { presets } from '../presets'
import type { PresetConfig } from '../engine/types'

export class PresetCycler {
  private presetList: PresetConfig[]
  private currentIndex: number = 0
  private intervalMs: number
  private timer: ReturnType<typeof setInterval> | null = null
  private onChange: (preset: PresetConfig) => void

  constructor(intervalMs: number, onChange: (preset: PresetConfig) => void) {
    this.presetList = [...presets]
    this.intervalMs = intervalMs
    this.onChange = onChange
  }

  start(): void {
    this.stop()
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.presetList.length
      this.onChange(this.presetList[this.currentIndex])
    }, this.intervalMs)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  setInterval(ms: number): void {
    this.intervalMs = ms
    if (this.timer) {
      this.stop()
      this.start()
    }
  }

  get isRunning(): boolean {
    return this.timer !== null
  }

  get current(): PresetConfig {
    return this.presetList[this.currentIndex]
  }
}
