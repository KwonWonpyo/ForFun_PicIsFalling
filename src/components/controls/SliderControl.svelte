<script lang="ts">
  interface Props {
    label: string
    value: number
    min: number
    max: number
    step?: number
    unit?: string
    onchange: (value: number) => void
  }

  let { label, value, min, max, step = 1, unit = '', onchange }: Props = $props()
</script>

<div class="slider-control">
  <div class="label-row">
    <span class="label-text">{label}</span>
    <span class="value-text">{value}{unit}</span>
  </div>
  <input
    type="range"
    {min}
    {max}
    {step}
    {value}
    aria-label={label}
    oninput={(e) => onchange(Number(e.currentTarget.value))}
  />
</div>

<style>
  .slider-control {
    margin-bottom: 8px;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    margin-bottom: 2px;
  }

  .label-text {
    color: #ccc;
  }

  .value-text {
    color: #8ab4f8;
    font-variant-numeric: tabular-nums;
  }

  input[type='range'] {
    width: 100%;
    height: 4px;
    appearance: none;
    background: #3a3f4b;
    border-radius: 2px;
    outline: none;
    cursor: pointer;
  }

  input[type='range']::-webkit-slider-thumb {
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #8ab4f8;
    cursor: pointer;
  }
</style>
