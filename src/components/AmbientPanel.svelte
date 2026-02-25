<script lang="ts">
  import { onDestroy } from 'svelte'
  import SliderControl from './controls/SliderControl.svelte'
  import { getTimeTheme, getTimeThemeLabel, PresetCycler } from '../lib/ambient'
  import { applyPreset } from '../stores/particleConfig'

  interface Props {
    onApply: () => void
    onTimeBackground: (gradient: string) => void
  }

  let { onApply, onTimeBackground }: Props = $props()

  let timeEnabled = $state(false)
  let cycleEnabled = $state(false)
  let cycleInterval = $state(30)
  let fullscreen = $state(false)
  let currentTimeLabel = $state(getTimeThemeLabel())

  let timeTimer: ReturnType<typeof setInterval> | null = null
  let cycler: PresetCycler | null = null

  function toggleTimeBackground() {
    timeEnabled = !timeEnabled
    if (timeEnabled) {
      applyTimeTheme()
      timeTimer = setInterval(applyTimeTheme, 60000)
    } else {
      if (timeTimer) clearInterval(timeTimer)
      timeTimer = null
    }
  }

  function applyTimeTheme() {
    const theme = getTimeTheme()
    currentTimeLabel = theme.label
    onTimeBackground(theme.gradient)
  }

  function toggleCycle() {
    cycleEnabled = !cycleEnabled
    if (cycleEnabled) {
      cycler = new PresetCycler(cycleInterval * 1000, (preset) => {
        applyPreset(preset)
        onApply()
      })
      cycler.start()
    } else {
      cycler?.stop()
      cycler = null
    }
  }

  function updateCycleInterval(val: number) {
    cycleInterval = val
    cycler?.setInterval(val * 1000)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      fullscreen = true
    } else {
      document.exitFullscreen()
      fullscreen = false
    }
  }

  onDestroy(() => {
    if (timeTimer) clearInterval(timeTimer)
    cycler?.stop()
  })
</script>

<div class="ambient-panel">
  <section>
    <h3>🌙 Ambient Mode</h3>
  </section>

  <section>
    <h4>시간대 배경</h4>
    <p class="desc">현재 시간에 맞는 배경 그라디언트를 자동 적용합니다.</p>
    <button class="toggle-btn" class:active={timeEnabled} onclick={toggleTimeBackground}>
      {timeEnabled ? `🌤️ 활성 (${currentTimeLabel})` : '⏸️ 비활성'}
    </button>
  </section>

  <section>
    <h4>자동 프리셋 순환</h4>
    <p class="desc">일정 간격으로 이펙트가 자동 전환됩니다.</p>
    <button class="toggle-btn" class:active={cycleEnabled} onclick={toggleCycle}>
      {cycleEnabled ? '🔄 순환 중' : '⏸️ 비활성'}
    </button>
    {#if cycleEnabled}
      <SliderControl
        label="전환 간격"
        value={cycleInterval}
        min={5}
        max={120}
        step={5}
        unit="초"
        onchange={updateCycleInterval}
      />
    {/if}
  </section>

  <section>
    <h4>전체화면</h4>
    <button class="toggle-btn wide" onclick={toggleFullscreen}>
      {fullscreen ? '🔲 전체화면 해제' : '🖥️ 전체화면'}
    </button>
  </section>

  <section>
    <h4>날씨 API 연동</h4>
    <span class="badge">준비 중</span>
  </section>

  <section>
    <h4>음악 비주얼라이저</h4>
    <span class="badge">준비 중</span>
  </section>
</div>

<style>
  .ambient-panel {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  section {
    padding: 8px 0;
    border-bottom: 1px solid #333;
  }

  h3 {
    font-size: 14px;
    color: #e0e0e0;
    margin-bottom: 4px;
  }

  h4 {
    font-size: 13px;
    color: #ccc;
    margin-bottom: 4px;
  }

  .desc {
    font-size: 12px;
    color: #888;
    line-height: 1.4;
    margin-bottom: 6px;
  }

  .toggle-btn {
    width: 100%;
    padding: 8px;
    background: #2a3040;
    border: 1px solid #555;
    border-radius: 6px;
    color: #ddd;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 6px;
  }

  .toggle-btn:hover {
    background: #3a4560;
  }

  .toggle-btn.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
    color: white;
  }

  .toggle-btn.wide {
    margin-bottom: 0;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid #444;
    border-radius: 10px;
    font-size: 10px;
    color: #888;
  }
</style>
