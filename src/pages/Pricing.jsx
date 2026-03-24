import React, { useEffect, useMemo, useState } from 'react'
import { ExternalLink, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import useAuthStore from '../store/authStore'

const CHECKOUT_URL = import.meta.env.VITE_LEMON_SQUEEZY_CHECKOUT_URL?.trim()

const isPlaceholderCheckoutUrl = (url) => {
  if (!url) return true
  const normalized = url.toLowerCase()
  return (
    normalized === '#coming-soon' ||
    normalized.includes('example.com') ||
    normalized === 'coming-soon'
  )
}

const Pricing = () => {
  const { user } = useAuthStore()
  const [planTier, setPlanTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPlan = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select('plan_tier')
          .eq('id', user.id)
          .single()

        if (fetchError) throw fetchError
        setPlanTier(data?.plan_tier === 'pro' ? 'pro' : 'free')
      } catch (err) {
        setPlanTier('free')
        setError('Failed to load plan status. Showing Free by default.')
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [user?.id])

  const isPro = useMemo(() => planTier === 'pro', [planTier])
  const hasValidCheckoutUrl = !isPlaceholderCheckoutUrl(CHECKOUT_URL)
  const canUpgrade = !isPro && hasValidCheckoutUrl

  const handleUpgrade = () => {
    if (!hasValidCheckoutUrl) {
      setError('Checkout is coming soon. Set a valid VITE_LEMON_SQUEEZY_CHECKOUT_URL to enable upgrades.')
      return
    }
    window.open(CHECKOUT_URL, '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-indigo-600">
        <Loader2 className="animate-spin" size={36} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pricing</h1>
        <p className="text-slate-500 text-sm mt-2">
          Current plan:{' '}
          <span className={isPro ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold'}>
            {isPro ? 'Pro' : 'Free'}
          </span>
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-2">Free</div>
          <div className="text-2xl font-black text-slate-900 mb-4">$0</div>
          <ul className="space-y-2 text-sm text-slate-600">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Up to 3 projects</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Up to 30 tasks per project</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Manual planning</li>
          </ul>
        </div>

        <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6">
          <div className="text-sm uppercase tracking-wider text-indigo-300 font-bold mb-2">Pro</div>
          <div className="text-2xl font-black mb-4">Upgrade</div>
          <ul className="space-y-2 text-sm text-slate-200 mb-6">
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Unlimited projects</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Unlimited tasks</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> AI plan generation</li>
            <li className="flex items-center gap-2"><CheckCircle2 size={14} /> Export features (planned)</li>
          </ul>
          <button
            onClick={handleUpgrade}
            disabled={!canUpgrade}
            className="w-full px-4 py-3 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isPro ? 'You are on Pro' : 'Upgrade to Pro'}
            {!isPro && <ExternalLink size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Pricing
