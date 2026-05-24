import { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext.js'
import { getStorageItem, setStorageItem } from '../utils/storage.js'

const APPEARANCE_STORAGE_KEY = 'draco-appearance'

export const THEME_OPTIONS = [
  {
    id: 'cloud',
    label: 'Cloud Light',
    description: 'Clear blue and white workspace with soft contrast.',
  },
  {
    id: 'sunrise',
    label: 'Sunrise',
    description: 'Warm peach, pink, and light gold environment.',
  },
  {
    id: 'lagoon',
    label: 'Lagoon',
    description: 'Fresh aqua and mint palette for a calm workspace.',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    description: 'Soft violet, sky, and pastel glow without heavy dark areas.',
  },
  {
    id: 'noir',
    label: 'Dark Noir',
    description: 'Premium deep black and grey workspace with neon accents.',
  },
  {
    id: 'ocean',
    label: 'Deep Ocean',
    description: 'Dark blue immersive environment with cyan reflections.',
  },
  {
    id: 'forest',
    label: 'Emerald Forest',
    description: 'Rich dark green and earthy tones for focused work.',
  },
]

export const SURFACE_OPTIONS = [
  {
    id: 'glass',
    label: 'Glass',
    description: 'Transparent panels with blur and floating layers.',
  },
  {
    id: 'liquid',
    label: 'Liquid Glass',
    description: 'Extreme frosted glass with deep blur and glowing borders.',
  },
  {
    id: 'soft',
    label: 'Soft',
    description: 'Gentle solid panels with smoother edges and less shine.',
  },
  {
    id: 'solid',
    label: 'Solid',
    description: 'Clear contrast and stronger card readability.',
  },
]

export const MOTION_OPTIONS = [
  {
    id: 'calm',
    label: 'Calm',
    description: 'Subtle motion with slower animations.',
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Balanced motion for everyday use.',
  },
  {
    id: 'vivid',
    label: 'Vivid',
    description: 'More visible movement and stronger animated atmosphere.',
  },
]

const DEFAULT_APPEARANCE = {
  theme: 'cloud',
  surface: 'glass',
  motion: 'standard',
}

function getAllowedValue(value, options, fallback) {
  return options.some((option) => option.id === value) ? value : fallback
}

function getStoredAppearance() {
  try {
    const storedValue = getStorageItem(APPEARANCE_STORAGE_KEY)

    if (!storedValue) {
      return DEFAULT_APPEARANCE
    }

    const parsedValue = JSON.parse(storedValue)

    return {
      theme: getAllowedValue(parsedValue.theme, THEME_OPTIONS, DEFAULT_APPEARANCE.theme),
      surface: getAllowedValue(parsedValue.surface, SURFACE_OPTIONS, DEFAULT_APPEARANCE.surface),
      motion: getAllowedValue(parsedValue.motion, MOTION_OPTIONS, DEFAULT_APPEARANCE.motion),
    }
  } catch {
    return DEFAULT_APPEARANCE
  }
}

function ThemeProvider({ children }) {
  const [appearance, setAppearance] = useState(getStoredAppearance)

  useEffect(() => {
    document.documentElement.dataset.theme = appearance.theme
    document.documentElement.dataset.surface = appearance.surface
    document.documentElement.dataset.motion = appearance.motion
    document.documentElement.style.colorScheme = appearance.theme === 'noir' ? 'dark' : 'light'

    setStorageItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance))
  }, [appearance])

  const contextValue = useMemo(() => ({
    appearance,
    themeOptions: THEME_OPTIONS,
    surfaceOptions: SURFACE_OPTIONS,
    motionOptions: MOTION_OPTIONS,
    setTheme: (theme) => {
      setAppearance((currentAppearance) => ({
        ...currentAppearance,
        theme: getAllowedValue(theme, THEME_OPTIONS, currentAppearance.theme),
      }))
    },
    setSurface: (surface) => {
      setAppearance((currentAppearance) => ({
        ...currentAppearance,
        surface: getAllowedValue(surface, SURFACE_OPTIONS, currentAppearance.surface),
      }))
    },
    setMotion: (motion) => {
      setAppearance((currentAppearance) => ({
        ...currentAppearance,
        motion: getAllowedValue(motion, MOTION_OPTIONS, currentAppearance.motion),
      }))
    },
    resetAppearance: () => {
      setAppearance(DEFAULT_APPEARANCE)
    },
  }), [appearance])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
