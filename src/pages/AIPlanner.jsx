import React, { useEffect, useMemo, useState } from 'react'
import { Sparkles, ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '../store/projectStore'
import useAuthStore from '../store/authStore'
import { supabase } from '../lib/supabaseClient'
import { useI18n } from '../i18n/useI18n'

function todayIsoDate () {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const AIPlanner = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { importPlan, saveProject } = useProjectStore()
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [planTier, setPlanTier] = useState('free')

  const isPro = planTier === 'pro'

  const [templateKey, setTemplateKey] = useState('other') // commercial | software | other
  const [durationMode, setDurationMode] = useState('lt6') // lt6 | mid | high | custom
  const [customMonths, setCustomMonths] = useState(12) // 1..18

  const [granularityMode, setGranularityMode] = useState('coarse') // coarse | fine | custom
  const [customTaskCount, setCustomTaskCount] = useState(15) // 1..30 (Pro custom)

  const [projectStartDate, setProjectStartDate] = useState(todayIsoDate)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!user?.id) {
          setPlanTier('free')
          return
        }
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('plan_tier')
          .eq('id', user.id)
          .single()
        if (cancelled) return
        if (!profileError && data?.plan_tier === 'pro') setPlanTier('pro')
        else setPlanTier('free')
      } catch {
        if (!cancelled) setPlanTier('free')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!isPro) {
      setDurationMode((d) => (d === 'custom' ? 'mid' : d))
      setGranularityMode((g) => (g === 'custom' ? 'coarse' : g))
    }
  }, [isPro])

  const clampInt = (v, min, max) => {
    const n = Number.parseInt(String(v), 10)
    if (Number.isNaN(n)) return min
    return Math.min(max, Math.max(min, n))
  }

  const templateOptions = useMemo(
    () => [
      { key: 'commercial', label: t('aiPlanner.template.commercial') },
      { key: 'software', label: t('aiPlanner.template.software') },
      { key: 'other', label: t('aiPlanner.template.other') }
    ],
    [t]
  )

  const buildConstraintsPayload = () => ({
    templateKey,
    durationMode,
    customMonths: isPro && durationMode === 'custom' ? clampInt(customMonths, 1, 18) : undefined,
    granularityMode,
    customTaskCount:
      isPro && granularityMode === 'custom' ? clampInt(customTaskCount, 1, 30) : undefined,
    projectStartDate
  })

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!idea.trim()) return

    setLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token
      if (!accessToken) {
        throw new Error(t('aiPlanner.signInAgain'))
      }

      const constraints = buildConstraintsPayload()

      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ idea, constraints })
      })

      const contentType = response.headers.get('content-type') || ''
      const rawText = await response.text()
      let data = null

      if (rawText) {
        if (contentType.includes('application/json')) {
          try {
            data = JSON.parse(rawText)
          } catch (parseError) {
            throw new Error('Invalid JSON response from /api/generate-plan.')
          }
        } else {
          try {
            data = JSON.parse(rawText)
          } catch (_) {
            data = null
          }
        }
      }

      if (!response.ok) {
        const message =
          (data && (data.error || data.message)) ||
          `Request failed (${response.status}).`
        throw new Error(message)
      }

      if (!data) {
        throw new Error('Empty response from /api/generate-plan.')
      }

      importPlan({ ...data, projectStartDate })

      if (user) {
        await saveProject(user.id)
      }

      navigate('/editor')
    } catch (err) {
      console.error('Error generating plan:', err)
      const message = err?.message || t('aiPlanner.genericError')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white p-12 md:p-16 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-16 -mb-16"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-sm border border-indigo-100">
              <Sparkles size={32} />
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{t('aiPlanner.title')}</h1>
            <p className="text-slate-500 text-sm font-medium mb-8">{t('aiPlanner.subtitle')}</p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="relative">
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder={t('aiPlanner.placeholder')}
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                  disabled={loading}
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {t('aiPlanner.constraintsTitle')}
                </div>

                {!isPro && (
                  <p className="text-[11px] text-slate-600 leading-snug">{t('aiPlanner.freeTierNote')}</p>
                )}
                {isPro && (
                  <p className="text-[11px] text-indigo-700 leading-snug font-semibold">{t('aiPlanner.proCustomHint')}</p>
                )}

                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-2">{t('aiPlanner.templateLabel')}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {templateOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setTemplateKey(opt.key)}
                        disabled={loading}
                        className={`rounded-xl border px-3 py-3 text-left text-[12px] font-bold transition-all ${
                          templateKey === opt.key
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-700 mb-1">{t('aiPlanner.projectStartLabel')}</div>
                  <input
                    type="date"
                    value={projectStartDate}
                    onChange={(e) => setProjectStartDate(e.target.value)}
                    disabled={loading}
                    className="w-full max-w-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-700">{t('aiPlanner.durationLabel')}</div>
                    <label className="flex items-center gap-2 text-[12px] text-slate-600">
                      <input type="radio" name="duration" checked={durationMode === 'lt6'} onChange={() => setDurationMode('lt6')} />
                      {t('aiPlanner.duration.lt6')}
                    </label>
                    <label className="flex items-center gap-2 text-[12px] text-slate-600">
                      <input type="radio" name="duration" checked={durationMode === 'mid'} onChange={() => setDurationMode('mid')} />
                      {t('aiPlanner.duration.mid')}
                    </label>
                    <label className="flex items-center gap-2 text-[12px] text-slate-600">
                      <input type="radio" name="duration" checked={durationMode === 'high'} onChange={() => setDurationMode('high')} />
                      {t('aiPlanner.duration.high')}
                    </label>
                    <label className={`flex items-center gap-2 text-[12px] ${isPro ? 'text-slate-600' : 'text-slate-400'}`}>
                      <input
                        type="radio"
                        name="duration"
                        checked={durationMode === 'custom'}
                        onChange={() => isPro && setDurationMode('custom')}
                        disabled={!isPro || loading}
                      />
                      {t('aiPlanner.duration.custom')}
                    </label>
                    {isPro && durationMode === 'custom' && (
                      <input
                        type="number"
                        value={customMonths}
                        min={1}
                        max={18}
                        onChange={(e) => setCustomMonths(e.target.value)}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-700">{t('aiPlanner.granularityLabel')}</div>
                    <label className="flex items-center gap-2 text-[12px] text-slate-600">
                      <input
                        type="radio"
                        name="granularity"
                        checked={granularityMode === 'coarse'}
                        onChange={() => setGranularityMode('coarse')}
                      />
                      {t('aiPlanner.granularity.coarse')}
                    </label>
                    <label className="flex items-center gap-2 text-[12px] text-slate-600">
                      <input
                        type="radio"
                        name="granularity"
                        checked={granularityMode === 'fine'}
                        onChange={() => setGranularityMode('fine')}
                      />
                      {t('aiPlanner.granularity.fine')}
                    </label>
                    <label className={`flex items-center gap-2 text-[12px] ${isPro ? 'text-slate-600' : 'text-slate-400'}`}>
                      <input
                        type="radio"
                        name="granularity"
                        checked={granularityMode === 'custom'}
                        onChange={() => isPro && setGranularityMode('custom')}
                        disabled={!isPro || loading}
                      />
                      {t('aiPlanner.granularity.custom')}
                    </label>
                    {isPro && granularityMode === 'custom' && (
                      <input
                        type="number"
                        value={customTaskCount}
                        min={1}
                        max={30}
                        onChange={(e) => setCustomTaskCount(e.target.value)}
                        className="w-full mt-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                      />
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">{t('aiPlanner.constraintsHelp')}</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-xs font-bold animate-shake">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <ArrowLeft size={18} /> {t('aiPlanner.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                  disabled={loading || !idea.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {t('aiPlanner.generating')}
                    </>
                  ) : (
                    <>
                      <Send size={18} /> {t('aiPlanner.generate')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <p className="mt-8 text-slate-400 text-xs font-black uppercase tracking-widest">{t('aiPlanner.poweredBy')}</p>
      </div>
    </div>
  )
}

export default AIPlanner
