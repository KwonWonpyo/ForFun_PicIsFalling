export interface TimeTheme {
  gradient: string
  label: string
}

const themes: Record<string, TimeTheme> = {
  dawn: {
    gradient: 'linear-gradient(180deg, #1a1a2e 0%, #4a3060 20%, #e07050 50%, #f0a060 70%, #f8d080 100%)',
    label: '새벽',
  },
  morning: {
    gradient: 'linear-gradient(180deg, #87CEEB 0%, #a8d8ea 30%, #d4e8f0 60%, #e8f4e8 80%, #90c090 100%)',
    label: '아침',
  },
  afternoon: {
    gradient: 'linear-gradient(180deg, #4a90d9 0%, #6aabe0 30%, #87CEEB 55%, #a0d0a0 80%, #70a070 100%)',
    label: '낮',
  },
  sunset: {
    gradient: 'linear-gradient(180deg, #2d1b4e 0%, #8b3a62 25%, #e06040 50%, #f0a030 75%, #f0c060 100%)',
    label: '노을',
  },
  evening: {
    gradient: 'linear-gradient(180deg, #0a0a20 0%, #1a1a40 30%, #2a2060 55%, #3a3080 75%, #252050 100%)',
    label: '저녁',
  },
  night: {
    gradient: 'linear-gradient(180deg, #050510 0%, #0a0a28 30%, #101040 60%, #0d0d30 80%, #080820 100%)',
    label: '밤',
  },
}

export function getTimeTheme(hour?: number): TimeTheme {
  const h = hour ?? new Date().getHours()

  if (h >= 5 && h < 7) return themes.dawn
  if (h >= 7 && h < 12) return themes.morning
  if (h >= 12 && h < 17) return themes.afternoon
  if (h >= 17 && h < 19) return themes.sunset
  if (h >= 19 && h < 21) return themes.evening
  return themes.night
}

export function getTimeThemeLabel(hour?: number): string {
  return getTimeTheme(hour).label
}

export function getAllThemes(): { key: string; theme: TimeTheme }[] {
  return Object.entries(themes).map(([key, theme]) => ({ key, theme }))
}
