<script lang="ts">
  import { downloadScene, loadSceneFromFile, copyShareUrl } from '../lib/scene'

  let shareStatus = $state('')

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
    <p class="desc">장면을 만들고 저장/공유/내보내기 할 수 있습니다.</p>
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
    <h4>스크린샷 내보내기</h4>
    <p class="placeholder">현재 화면을 PNG로 캡처합니다.</p>
    <span class="badge">준비 중</span>
  </section>

  <section>
    <h4>멀티 레이어</h4>
    <p class="placeholder">여러 이펙트를 동시에 겹쳐 깊이감을 표현합니다.</p>
    <span class="badge">준비 중</span>
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

  .placeholder {
    font-size: 12px;
    color: #666;
    font-style: italic;
  }

  .badge {
    display: inline-block;
    margin-top: 4px;
    padding: 2px 8px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid #444;
    border-radius: 10px;
    font-size: 10px;
    color: #888;
  }
</style>
