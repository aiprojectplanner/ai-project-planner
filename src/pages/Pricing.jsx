import React, { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, AlertCircle, Loader2, KeyRound } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import useAuthStore from '../store/authStore'

const Pricing = () => {
  const { user } = useAuthStore()
  const [planTier, setPlanTier] = useState('free')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inviteCode, setInviteCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [notice, setNotice] = useState(null)

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

  const handleRedeem = async () => {
    const trimmed = inviteCode.trim()
    if (!trimmed) {
      setError('Please enter an invite code.')
      return
    }

    setError(null)
    setNotice(null)
    setRedeeming(true)
    try {
      const { data, error: rpcError } = await supabase.rpc('redeem_invite_code', {
        input_code: trimmed,
      })
      if (rpcError) throw rpcError

      const result = Array.isArray(data) ? data[0] : null
      if (!result?.ok) {
        setError(result?.message || 'Failed to redeem invite code.')
        return
      }

      setPlanTier('pro')
      setNotice(result.message || 'Invite code redeemed successfully.')
      setInviteCode('')
    } catch (err) {
      console.error('Invite code redeem error:', err)
      setError('Failed to redeem invite code.')
    } finally {
      setRedeeming(false)
    }
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
      {notice && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
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
          {isPro ? (
            <div className="w-full px-4 py-3 rounded-xl font-bold bg-emerald-600 text-center">
              You are on Pro
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-indigo-200 font-bold block">
                Invite Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter your invite code"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="px-4 py-2 rounded-xl font-bold bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {redeeming ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                  Redeem
                </button>
              </div>
              <p className="text-xs text-slate-300">
                Pro access is currently invite-only. Contact the founder to get a code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Pricing
