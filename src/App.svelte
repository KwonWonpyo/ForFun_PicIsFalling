<script lang="ts">
  import Canvas from './components/Canvas.svelte'
  import ControlPanel from './components/ControlPanel.svelte'
  import SidePanel from './components/layout/SidePanel.svelte'

  let canvas: Canvas | undefined = $state()
  let layers: string[] = $state([])

  function handleApply() {
    canvas?.apply()
  }

  function handleClear() {
    canvas?.clear()
  }

  function handleScreenshot() {
    canvas?.screenshot()
  }

  function handleAddLayer(presetName: string) {
    canvas?.addLayer(presetName)
    layers = [...layers, presetName]
  }

  function handleRemoveLayer(index: number) {
    canvas?.removeLayer(index)
    layers = layers.filter((_, i) => i !== index)
  }
</script>

<Canvas bind:this={canvas} />

<SidePanel>
  <ControlPanel
    onApply={handleApply}
    onClear={handleClear}
    onScreenshot={handleScreenshot}
    onAddLayer={handleAddLayer}
    onRemoveLayer={handleRemoveLayer}
    {layers}
  />
</SidePanel>
