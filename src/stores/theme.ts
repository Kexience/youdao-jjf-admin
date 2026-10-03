import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ThemeMode / ResolvedTheme 见全局类型（src/types/global.d.ts）

const STORAGE_KEY = 'jjf-admin-theme'

interface ThemeState {
  /** 用户选择的模式，默认跟随系统 */
  mode: ThemeMode
  /** 系统当前是否为深色（由 matchMedia 维护） */
  systemDark: boolean
  setMode: (mode: ThemeMode) => void
  /** 在 light / dark 之间切换；若当前为 system，则按解析结果取反 */
  toggle: () => void
}

function getSystemDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function resolveTheme(mode: ThemeMode, systemDark: boolean): ResolvedTheme {
  if (mode === 'system') return systemDark ? 'dark' : 'light'
  return mode
}

function applyThemeToDOM(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.dataset.theme = resolved
  root.classList.toggle('dark', resolved === 'dark')
  root.style.colorScheme = resolved
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      systemDark: getSystemDark(),
      setMode: (mode) => set({ mode }),
      toggle: () => {
        const { mode, systemDark } = get()
        const resolved = resolveTheme(mode, systemDark)
        set({ mode: resolved === 'dark' ? 'light' : 'dark' })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ mode: state.mode }) as ThemeState,
    },
  ),
)

/** 解析后的实际主题，直接从 store 派生 */
export function useResolvedTheme(): ResolvedTheme {
  return useThemeStore((s) => resolveTheme(s.mode, s.systemDark))
}

// ---- 副作用全部收敛在 store 模块内，对外无感 ----

// 初次加载即应用一次，避免首屏闪烁
applyThemeToDOM(resolveTheme(useThemeStore.getState().mode, useThemeStore.getState().systemDark))

// 跟随系统：OS 切换时更新 systemDark
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  const onChange = (e: MediaQueryListEvent) => {
    useThemeStore.setState({ systemDark: e.matches })
  }
  mql.addEventListener('change', onChange)
}

// 任何模式变化都同步到 <html>
useThemeStore.subscribe((state) => {
  applyThemeToDOM(resolveTheme(state.mode, state.systemDark))
})
