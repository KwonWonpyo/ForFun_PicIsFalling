<script lang="ts">
  import { panelOpen } from '../../stores/appState'
  import type { Snippet } from 'svelte'

  interface Props {
    children: Snippet
  }

  let { children }: Props = $props()

  function toggle() {
    panelOpen.update((v) => !v)
  }
</script>

<aside class="side-panel" class:open={$panelOpen}>
  <div class="panel-body">
    {@render children()}
  </div>
  <button class="toggle-btn" onclick={toggle} aria-label="패널 토글">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d={$panelOpen ? 'M10 3L5 8L10 13' : 'M6 3L11 8L6 13'}
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</aside>

<style>
  .side-panel {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(-280px);
    transition: transform 0.3s ease;
    z-index: 100;
    display: flex;
  }

  .side-panel.open {
    transform: translateX(0);
  }

  .panel-body {
    flex: 1;
    background: rgba(20, 25, 40, 0.92);
    backdrop-filter: blur(12px);
    padding: 16px;
    overflow-y: auto;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }

  .toggle-btn {
    position: absolute;
    right: -32px;
    top: 50%;
    transform: translateY(-50%);
    width: 32px;
    height: 56px;
    background: rgba(20, 25, 40, 0.92);
    backdrop-filter: blur(12px);
    border: none;
    border-radius: 0 8px 8px 0;
    color: #aaa;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s, background 0.2s;
  }

  .toggle-btn:hover {
    color: white;
    background: rgba(30, 40, 60, 0.95);
  }
</style>
