import type { Application } from 'pixi.js'

export function captureScreenshot(app: Application): string {
  const canvas = app.canvas as HTMLCanvasElement
  return canvas.toDataURL('image/png')
}

export function downloadScreenshot(app: Application, filename: string = 'screenshot.png'): void {
  const dataUrl = captureScreenshot(app)
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = filename
  a.click()
}
