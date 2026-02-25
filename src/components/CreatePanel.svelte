<script lang="ts">
  import { downloadScene, loadSceneFromFile, copyShareUrl } from '../lib/scene'
  import { presets } from '../lib/presets'

  interface Props {
    onScreenshot: () => void
    onAddLayer: (presetName: string) => void
    onRemoveLayer: (index: number) => void
    layers: string[]
  }

  let { onScreenshot, onAddLayer, onRemoveLayer, layers }: Props = $props()

  let shareStatus = $state('')
  let selectedLayerPreset = $state('snow')

  async function handleShare() {
    const ok = await copyShareUrl()
    shareStatus = ok ? '✅ 링크가 복사되었습니다!' : '❌ 복사 실패'
    setTimeout(() => (shareStatus = ''), 3000)
  }

  async function handleLoad() {
    const ok = await loadSceneFromFile()
    if (!ok) alert('파일을 불러올 수 없습니다.')
  }
</script>

<div class="create-panel">
  <section>
    <h3>🎨 Create Mode</h3>
  </section>

  <section>
    <h4>장면 저장/불러오기</h4>
    <div class="btn-row">
      <button class="action-btn" onclick={() => downloadScene()}>
        💾 JSON 저장
      </button>
      <button class="action-btn" onclick={handleLoad}>
        📂 불러오기
      </button>
    </div>
  </section>

  <section>
    <h4>URL 공유</h4>
    <button class="action-btn wide" onclick={handleShare}>
      🔗 공유 링크 복사
    </button>
    {#if shareStatus}
      <p class="status">{shareStatus}</p>
    {/if}
  </section>

  <section>
    <h4>스크린샷</h4>
    <button class="action-btn wide" onclick={onScreenshot}>
      📸 PNG 스크린샷 저장
    </button>
  </section>

  <section>
    <h4>멀티 레이어</h4>
    <p class="desc">여러 이펙트를 동시에 겹쳐 깊이감을 표현합니다.</p>
    <div class="layer-add">
      <select bind:value={selectedLayerPreset} class="layer-select">
        {#each presets as preset (preset.name)}
          <option value={preset.name}>{preset.label}</option>
        {/each}
      </select>
      <button class="action-btn" onclick={() => onAddLayer(selectedLayerPreset)}>
        + 레이어 추가
      </button>
    </div>
    {#if layers.length > 0}
      <div class="layer-list">
        {#each layers as layerPreset, i (i)}
          <div class="layer-item">
            <span class="layer-name">레이어 {i + 1}: {layerPreset}</span>
            <button class="layer-remove" onclick={() => onRemoveLayer(i)}>✕</button>
          </div>
        {/each}
      </div>
    {:else}
      <p class="placeholder">추가된 레이어가 없습니다.</p>
    {/if}
  </section>
</div>

<style>
  .create-panel {
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
    margin-bottom: 6px;
  }

  .desc {
    font-size: 12px;
    color: #888;
    line-height: 1.4;
    margin-bottom: 6px;
  }

  .btn-row {
    display: flex;
    gap: 6px;
  }

  .action-btn {
    flex: 1;
    padding: 8px 8px;
    background: #2a3040;
    border: 1px solid #555;
    border-radius: 6px;
    color: #ddd;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .action-btn:hover {
    background: #3a4560;
  }

  .action-btn.wide {
    flex: none;
    width: 100%;
  }

  .status {
    font-size: 11px;
    color: #8ab4f8;
    margin-top: 4px;
  }

  .layer-add {
    display: flex;
    gap: 6px;
    margin-bottom: 8px;
  }

  .layer-select {
    flex: 1;
    padding: 6px;
    background: #2a3040;
    border: 1px solid #555;
    border-radius: 6px;
    color: #ddd;
    font-size: 12px;
  }

  .layer-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .layer-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 8px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .layer-name {
    font-size: 12px;
    color: #ccc;
  }

  .layer-remove {
    background: none;
    border: none;
    color: #ff6b6b;
    cursor: pointer;
    font-size: 14px;
    padding: 0 4px;
  }

  .layer-remove:hover {
    color: #ff4444;
  }

  .placeholder {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }
</style>
