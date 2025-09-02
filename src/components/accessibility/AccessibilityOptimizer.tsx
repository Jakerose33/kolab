import { useState, useEffect } from 'react'
import { Eye, EyeOff, Type, Contrast, Volume2, VolumeX, MousePointer, Keyboard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

interface AccessibilitySettings {
  fontSize: number
  contrast: number
  reducedMotion: boolean
  screenReader: boolean
  keyboardNavigation: boolean
  focusRing: boolean
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  textSpacing: number
  soundEnabled: boolean
  dyslexiaFont: boolean
}

export function AccessibilityOptimizer() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: 1,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusRing: true,
    colorBlindMode: 'none',
    textSpacing: 1,
    soundEnabled: true,
    dyslexiaFont: false
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Load saved accessibility settings
    const saved = localStorage.getItem('accessibility-settings')
    if (saved) {
      try {
        const parsedSettings = JSON.parse(saved)
        setSettings(parsedSettings)
        applySettings(parsedSettings)
      } catch (error) {
        console.error('Error loading accessibility settings:', error)
      }
    }

    // Check for user preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      updateSetting('reducedMotion', true)
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      updateSetting('contrast', 1.5)
    }
  }, [])

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    applySettings(newSettings)
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings))
  }

  const applySettings = (settings: AccessibilitySettings) => {
    const root = document.documentElement

    // Font size
    root.style.setProperty('--base-font-size', `${settings.fontSize}px`)

    // Contrast
    root.style.setProperty('--contrast-multiplier', settings.contrast.toString())

    // Reduced motion
    if (settings.reducedMotion) {
      root.style.setProperty('--animation-duration', '0.01ms')
      root.classList.add('reduce-motion')
    } else {
      root.style.removeProperty('--animation-duration')
      root.classList.remove('reduce-motion')
    }

    // Focus ring
    if (settings.focusRing) {
      root.classList.add('enhanced-focus')
    } else {
      root.classList.remove('enhanced-focus')
    }

    // Color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia')
    if (settings.colorBlindMode !== 'none') {
      root.classList.add(settings.colorBlindMode)
    }

    // Text spacing
    root.style.setProperty('--text-spacing-multiplier', settings.textSpacing.toString())

    // Dyslexia font
    if (settings.dyslexiaFont) {
      root.classList.add('dyslexia-font')
    } else {
      root.classList.remove('dyslexia-font')
    }

    // Keyboard navigation
    if (settings.keyboardNavigation) {
      setupKeyboardNavigation()
    }
  }

  const setupKeyboardNavigation = () => {
    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation')
      }
      
      // Skip to main content (Alt + S)
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        const main = document.querySelector('main')
        if (main) {
          main.focus()
          main.scrollIntoView()
        }
      }

      // Skip to navigation (Alt + N)
      if (e.altKey && e.key === 'n') {
        e.preventDefault()
        const nav = document.querySelector('nav')
        if (nav) {
          const firstLink = nav.querySelector('a, button')
          if (firstLink) {
            (firstLink as HTMLElement).focus()
          }
        }
      }
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation')
    })
  }

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      contrast: 1,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusRing: true,
      colorBlindMode: 'none',
      textSpacing: 1,
      soundEnabled: true,
      dyslexiaFont: false
    }
    setSettings(defaultSettings)
    applySettings(defaultSettings)
    localStorage.removeItem('accessibility-settings')
  }

  const announceForScreenReader = (message: string) => {
    if (settings.screenReader) {
      const announcement = document.createElement('div')
      announcement.setAttribute('aria-live', 'polite')
      announcement.setAttribute('aria-atomic', 'true')
      announcement.className = 'sr-only'
      announcement.textContent = message
      document.body.appendChild(announcement)
      setTimeout(() => document.body.removeChild(announcement), 1000)
    }
  }

  return (
    <>
      {/* Accessibility Toggle Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg"
        aria-label="Toggle accessibility options"
        title="Accessibility Options"
      >
        <Eye className="h-5 w-5" />
      </Button>

      {/* Accessibility Panel */}
      {isVisible && (
        <Card className="fixed bottom-20 right-4 z-50 w-80 max-h-96 overflow-y-auto shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Accessibility</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                aria-label="Close accessibility panel"
              >
                <EyeOff className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Tabs defaultValue="visual" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="visual">Visual</TabsTrigger>
                <TabsTrigger value="motor">Motor</TabsTrigger>
                <TabsTrigger value="cognitive">Cognitive</TabsTrigger>
              </TabsList>

              {/* Visual Accessibility */}
              <TabsContent value="visual" className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Font Size: {settings.fontSize}px
                  </Label>
                  <Slider
                    value={[settings.fontSize]}
                    onValueChange={([value]) => updateSetting('fontSize', value)}
                    min={12}
                    max={24}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Contrast className="h-4 w-4" />
                    Contrast: {Math.round(settings.contrast * 100)}%
                  </Label>
                  <Slider
                    value={[settings.contrast]}
                    onValueChange={([value]) => updateSetting('contrast', value)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color Blind Support</Label>
                  <Select 
                    value={settings.colorBlindMode} 
                    onValueChange={(value) => updateSetting('colorBlindMode', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="protanopia">Protanopia</SelectItem>
                      <SelectItem value="deuteranopia">Deuteranopia</SelectItem>
                      <SelectItem value="tritanopia">Tritanopia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="dyslexia-font">Dyslexia-Friendly Font</Label>
                  <Switch
                    id="dyslexia-font"
                    checked={settings.dyslexiaFont}
                    onCheckedChange={(checked) => updateSetting('dyslexiaFont', checked)}
                  />
                </div>
              </TabsContent>

              {/* Motor Accessibility */}
              <TabsContent value="motor" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="keyboard-nav" className="flex items-center gap-2">
                    <Keyboard className="h-4 w-4" />
                    Enhanced Keyboard Navigation
                  </Label>
                  <Switch
                    id="keyboard-nav"
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="focus-ring">Enhanced Focus Ring</Label>
                  <Switch
                    id="focus-ring"
                    checked={settings.focusRing}
                    onCheckedChange={(checked) => updateSetting('focusRing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reduced-motion">Reduce Motion</Label>
                  <Switch
                    id="reduced-motion"
                    checked={settings.reducedMotion}
                    onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                  />
                </div>

                <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                  <strong>Keyboard Shortcuts:</strong><br />
                  Alt + S: Skip to main content<br />
                  Alt + N: Skip to navigation
                </div>
              </TabsContent>

              {/* Cognitive Accessibility */}
              <TabsContent value="cognitive" className="space-y-4">
                <div className="space-y-2">
                  <Label>Text Spacing: {Math.round(settings.textSpacing * 100)}%</Label>
                  <Slider
                    value={[settings.textSpacing]}
                    onValueChange={([value]) => updateSetting('textSpacing', value)}
                    min={1}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="screen-reader" className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4" />
                    Screen Reader Support
                  </Label>
                  <Switch
                    id="screen-reader"
                    checked={settings.screenReader}
                    onCheckedChange={(checked) => {
                      updateSetting('screenReader', checked)
                      if (checked) {
                        announceForScreenReader('Screen reader support enabled')
                      }
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled">Sound Feedback</Label>
                  <Switch
                    id="sound-enabled"
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="pt-4 border-t">
              <Button variant="outline" onClick={resetSettings} className="w-full">
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Screen Reader Only Instructions */}
      <div className="sr-only">
        <h2>Accessibility Options Available</h2>
        <p>
          Use the accessibility button to customize the interface for your needs.
          Available options include font size adjustment, contrast control, 
          keyboard navigation, and screen reader support.
        </p>
      </div>

      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50">
        <a href="#main-content" className="bg-primary text-primary-foreground px-4 py-2 rounded">
          Skip to main content
        </a>
        <a href="#navigation" className="bg-primary text-primary-foreground px-4 py-2 rounded ml-2">
          Skip to navigation
        </a>
      </div>
    </>
  )
}