import React from 'react'
import { useI18n } from '../i18n/useI18n'

const LanguageSwitcher = ({ className = '' }) => {
  const { locale, setLocale } = useI18n()

  const btn = (code, label) => (
    <button
      type="button"
      onClick={() => setLocale(code)}
      className={`px-2 py-1 rounded-md text-xs font-bold transition-colors ${
        locale === code ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm ${className}`}
      role="group"
      aria-label="Language"
    >
      {btn('en', 'EN')}
      {btn('zh', '中文')}
    </div>
  )
}

export default LanguageSwitcher
