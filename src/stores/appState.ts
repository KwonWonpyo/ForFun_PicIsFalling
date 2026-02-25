import { writable } from 'svelte/store'

export type AppMode = 'default' | 'ambient' | 'create'

export const panelOpen = writable(true)
export const currentMode = writable<AppMode>('default')
export const backgroundColor = writable('#0d182c')
export const backgroundImage = writable<string | null>(null)
export const useBackgroundImage = writable(false)
export const ambientGradient = writable<string | null>(null)
