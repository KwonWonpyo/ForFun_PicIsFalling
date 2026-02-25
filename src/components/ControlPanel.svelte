<script lang="ts">
  import SliderControl from './controls/SliderControl.svelte'
  import ColorPicker from './controls/ColorPicker.svelte'
  import ImageUploader from './controls/ImageUploader.svelte'
  import PresetSelector from './controls/PresetSelector.svelte'
  import ModeTabs from './controls/ModeTabs.svelte'
  import AmbientPanel from './AmbientPanel.svelte'
  import CreatePanel from './CreatePanel.svelte'
  import {
    spawnRate,
    maxParticles,
    minSize,
    maxSize,
    opacity,
    speed,
    speedVariety,
    particleColor,
    customTexture,
    useCustomTexture,
    currentPresetName,
    applyPreset,
  } from '../stores/particleConfig'
  import {
    backgroundColor,
    backgroundImage,
    useBackgroundImage,
    currentMode,
  } from '../stores/appState'
  import type { PresetConfig } from '../lib/engine/types'

  interface Props {
    onApply: () => void
    onClear: () => void
    onScreenshot: () => void
    onAddLayer: (presetName: string) => void
    onRemoveLayer: (index: number) => void
    onTimeBackground: (gradient: string) => void
    layers: string[]
  }

  let { onApply, onClear, onScreenshot, onAddLayer, onRemoveLayer, onTimeBackground, layers }: Props = $props()

  function handlePresetSelect(preset: PresetConfig) {
    applyPreset(preset)
    onApply()
  }
</script>

<div class="panel-content">
  <ModeTabs />

  <section>
    <h3>이펙트 선택</h3>
    <PresetSelector current={$currentPresetName} onselect={handlePresetSelect} />
  </section>

  {#if $currentMode === 'ambient'}
    <AmbientPanel {onApply} {onTimeBackground} />
  {:else if $currentMode === 'create'}
    <CreatePanel {onScreenshot} {onAddLayer} {onRemoveLayer} {layers} />
  {/if}

  <section>
    <h3>파티클 설정</h3>
    <SliderControl
      label="파티클 수"
      value={$maxParticles}
      min={50}
      max={3000}
      step={50}
      onchange={(v) => maxParticles.set(v)}
    />
    <SliderControl
      label="생성 속도"
      value={$spawnRate}
      min={5}
      max={200}
      step={5}
      unit="/s"
      onchange={(v) => spawnRate.set(v)}
    />
    <SliderControl
      label="최소 크기"
      value={$minSize}
      min={1}
      max={20}
      step={0.5}
      onchange={(v) => minSize.set(v)}
    />
    <SliderControl
      label="최대 크기"
      value={$maxSize}
      min={2}
      max={30}
      step={0.5}
      onchange={(v) => maxSize.set(v)}
    />
    <SliderControl
      label="투명도"
      value={$opacity}
      min={0.1}
      max={1}
      step={0.05}
      onchange={(v) => opacity.set(v)}
    />
    <SliderControl
      label="낙하 속도"
      value={$speed}
      min={1}
      max={20}
      step={0.5}
      onchange={(v) => speed.set(v)}
    />
    <SliderControl
      label="속도 다양성"
      value={$speedVariety}
      min={0}
      max={5}
      step={0.5}
      onchange={(v) => speedVariety.set(v)}
    />
    <ColorPicker
      label="파티클 색상"
      value={$particleColor}
      onchange={(v) => particleColor.set(v)}
    />
  </section>

  <section>
    <h3>커스텀 이미지</h3>
    <label class="toggle-row">
      <input
        type="checkbox"
        checked={$useCustomTexture}
        onchange={(e) => useCustomTexture.set(e.currentTarget.checked)}
      />
      <span>이미지 눈송이 사용</span>
    </label>
    {#if $useCustomTexture}
      <ImageUploader
        label=""
        preview={$customTexture}
        onupload={(url) => customTexture.set(url)}
      />
    {/if}
  </section>

  <section>
    <h3>배경 설정</h3>
    <label class="toggle-row">
      <input
        type="radio"
        name="bg"
        checked={!$useBackgroundImage}
        onchange={() => useBackgroundImage.set(false)}
      />
      <span>단색 배경</span>
    </label>
    {#if !$useBackgroundImage}
      <ColorPicker
        label=""
        value={$backgroundColor}
        onchange={(v) => backgroundColor.set(v)}
      />
    {/if}
    <label class="toggle-row">
      <input
        type="radio"
        name="bg"
        checked={$useBackgroundImage}
        onchange={() => useBackgroundImage.set(true)}
      />
      <span>이미지 배경</span>
    </label>
    {#if $useBackgroundImage}
      <ImageUploader
        label=""
        preview={$backgroundImage}
        onupload={(url) => backgroundImage.set(url)}
      />
    {/if}
  </section>

  <div class="button-row">
    <button class="btn btn-apply" onclick={onApply}>바로 적용</button>
    <button class="btn btn-clear" onclick={onClear}>모두 제거</button>
  </div>
</div>

<style>
  .panel-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
    height: 100%;
    overflow-y: auto;
  }

  section {
    padding: 8px 0;
    border-bottom: 1px solid #333;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #e0e0e0;
    margin-bottom: 8px;
  }

  .toggle-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #ccc;
    margin-bottom: 6px;
    cursor: pointer;
  }

  .button-row {
    display: flex;
    gap: 8px;
    padding: 12px 0;
  }

  .btn {
    flex: 1;
    padding: 8px 0;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-apply {
    background: #3b82f6;
    color: white;
  }

  .btn-apply:hover {
    background: #2563eb;
  }

  .btn-clear {
    background: #374151;
    color: #e0e0e0;
  }

  .btn-clear:hover {
    background: #4b5563;
  }

  @media (max-width: 480px) {
    section {
      padding: 6px 0;
    }

    h3 {
      font-size: 13px;
    }

    .button-row {
      padding: 8px 0;
    }
  }
</style>
