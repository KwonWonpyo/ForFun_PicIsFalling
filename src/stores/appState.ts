import { writable } from 'svelte/store'

export const panelOpen = writable(true)
export const backgroundColor = writable('#0d182c')
export const backgroundImage = writable<string | null>(null)
export const useBackgroundImage = writable(false)
