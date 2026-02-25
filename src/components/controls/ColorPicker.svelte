<script lang="ts">
  interface Props {
    label: string
    value: string
    onchange: (value: string) => void
  }

  let { label, value, onchange }: Props = $props()
</script>

<div class="color-picker">
  <span class="label-text">{label}</span>
  <div class="input-row">
    <input
      type="color"
      {value}
      oninput={(e) => onchange(e.currentTarget.value)}
    />
    <span class="hex-value">{value}</span>
  </div>
</div>

<style>
  .color-picker {
    margin-bottom: 8px;
  }

  .label-text {
    font-size: 13px;
    color: #ccc;
    display: block;
    margin-bottom: 4px;
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  input[type='color'] {
    width: 32px;
    height: 24px;
    border: 1px solid #555;
    border-radius: 4px;
    padding: 0;
    cursor: pointer;
    background: none;
  }

  .hex-value {
    font-size: 12px;
    color: #999;
    font-family: monospace;
  }
</style>
