<script lang="ts">
  import { currentMode } from '../../stores/appState'
  import type { AppMode } from '../../stores/appState'

  const modes: { id: AppMode; label: string; icon: string }[] = [
    { id: 'default', label: '기본', icon: '✨' },
    { id: 'ambient', label: 'Ambient', icon: '🌙' },
    { id: 'create', label: 'Create', icon: '🎨' },
  ]
</script>

<nav class="mode-tabs">
  {#each modes as mode (mode.id)}
    <button
      class="tab"
      class:active={$currentMode === mode.id}
      onclick={() => currentMode.set(mode.id)}
    >
      <span class="tab-icon">{mode.icon}</span>
      <span class="tab-label">{mode.label}</span>
    </button>
  {/each}
</nav>

<style>
  .mode-tabs {
    display: flex;
    gap: 2px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    padding: 3px;
    margin-bottom: 12px;
  }

  .tab {
    flex: 1;
    padding: 6px 4px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #999;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .tab:hover {
    color: #ccc;
    background: rgba(255, 255, 255, 0.05);
  }

  .tab.active {
    background: rgba(59, 130, 246, 0.25);
    color: white;
  }

  .tab-icon {
    font-size: 16px;
  }

  .tab-label {
    font-size: 11px;
    font-weight: 500;
  }
</style>
