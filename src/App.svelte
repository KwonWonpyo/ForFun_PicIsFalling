<script lang="ts">
  import Canvas from './components/Canvas.svelte'
  import ControlPanel from './components/ControlPanel.svelte'
  import SidePanel from './components/layout/SidePanel.svelte'
  import { ambientGradient } from './stores/appState'

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

  function handleTimeBackground(gradient: string) {
    ambientGradient.set(gradient)
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
    onTimeBackground={handleTimeBackground}
    {layers}
  />
</SidePanel>
