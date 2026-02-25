<script lang="ts">
</script>

<div class="ambient-panel">
  <section>
    <h3>🌙 Ambient Mode</h3>
    <p class="desc">실시간 데이터와 연동하여 자동으로 분위기를 연출합니다.</p>
  </section>

  <section>
    <h4>시간대 배경</h4>
    <p class="placeholder">시간에 따라 배경색이 자동 변경됩니다.</p>
    <span class="badge">준비 중</span>
  </section>

  <section>
    <h4>자동 프리셋 순환</h4>
    <p class="placeholder">일정 간격으로 이펙트가 부드럽게 전환됩니다.</p>
    <span class="badge">준비 중</span>
  </section>

  <section>
    <h4>날씨 API 연동</h4>
    <p class="placeholder">현재 날씨에 맞는 이펙트를 자동 적용합니다.</p>
    <span class="badge">준비 중</span>
  </section>

  <section>
    <h4>음악 비주얼라이저</h4>
    <p class="placeholder">음악 BPM에 따라 파티클이 반응합니다.</p>
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
