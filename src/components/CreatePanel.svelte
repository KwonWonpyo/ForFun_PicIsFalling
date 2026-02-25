<script lang="ts">
</script>

<div class="create-panel">
  <section>
    <h3>🎨 Create Mode</h3>
    <p class="desc">장면을 만들고 저장/공유/내보내기 할 수 있습니다.</p>
  </section>

  <section>
    <h4>장면 저장/불러오기</h4>
    <p class="placeholder">현재 설정을 JSON으로 저장하고 불러옵니다.</p>
    <span class="badge">준비 중</span>
  </section>

  <section>
    <h4>URL 공유</h4>
    <p class="placeholder">파라미터를 URL에 인코딩하여 공유 링크를 생성합니다.</p>
    <span class="badge">준비 중</span>
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
    margin-bottom: 4px;
  }

  .desc {
    font-size: 12px;
    color: #888;
    line-height: 1.4;
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
