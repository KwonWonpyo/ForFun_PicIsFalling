<script lang="ts">
  import { presets } from '../../lib/presets'
  import type { PresetConfig } from '../../lib/engine/types'

  interface Props {
    current: string
    onselect: (preset: PresetConfig) => void
  }

  let { current, onselect }: Props = $props()
</script>

<div class="preset-selector">
  {#each presets as preset (preset.name)}
    <button
      class="preset-btn"
      class:active={current === preset.name}
      onclick={() => onselect(preset)}
    >
      <span class="preset-label">{preset.label}</span>
    </button>
  {/each}
</div>

<style>
  .preset-selector {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-bottom: 12px;
  }

  .preset-btn {
    padding: 10px 4px;
    border: 1px solid #444;
    border-radius: 8px;
    background: rgba(40, 45, 60, 0.8);
    color: #ccc;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .preset-btn:hover {
    background: rgba(60, 70, 90, 0.9);
    border-color: #666;
  }

  .preset-btn.active {
    background: rgba(59, 130, 246, 0.3);
    border-color: #3b82f6;
    color: white;
  }

  .preset-label {
    display: block;
  }
</style>
