import React, { useEffect, useMemo, useState } from 'react'
import { messages } from './messages'
import { I18nContext } from './context'

const STORAGE_KEY = 'app.locale'

function getNestedString(dict, path) {
  const keys = path.split('.')
  let cur = dict
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object' || !(k in cur)) {
      return null
    }
    cur = cur[k]
  }
  return typeof cur === 'string' ? cur : null
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'en' || stored === 'zh') return stored
    } catch (_) {
      /* ignore */
    }
    if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('zh')) {
      return 'zh'
    }
    return 'en'
  })

  const setLocale = (next) => {
    if (next !== 'en' && next !== 'zh') return
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch (_) {
      /* ignore */
    }
  }

  useEffect(() => {
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en'
  }, [locale])

  const t = useMemo(() => {
    const dict = messages[locale] || messages.en
    return (key, vars) => {
      let s = getNestedString(dict, key)
      if (s == null) s = getNestedString(messages.en, key)
      if (s == null) s = key
      if (vars && typeof s === 'string') {
        Object.entries(vars).forEach(([k, v]) => {
          s = s.replaceAll(`{${k}}`, String(v))
        })
      }
      return s
    }
  }, [locale])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
