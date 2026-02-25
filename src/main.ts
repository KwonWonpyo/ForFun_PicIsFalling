import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { loadSceneFromUrl } from './lib/scene'

const app = mount(App, {
  target: document.getElementById('app')!,
})

loadSceneFromUrl()

export default app
