<script lang="ts">
  import Canvas from './components/Canvas.svelte'
  import ControlPanel from './components/ControlPanel.svelte'
  import SidePanel from './components/layout/SidePanel.svelte'

  let canvas: Canvas | undefined = $state()

  function handleApply() {
    canvas?.apply()
  }

  function handleClear() {
    canvas?.clear()
  }
</script>

<Canvas bind:this={canvas} />

<SidePanel>
  <ControlPanel onApply={handleApply} onClear={handleClear} />
</SidePanel>
