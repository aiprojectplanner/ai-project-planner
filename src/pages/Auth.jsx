import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n/useI18n'
import BrandLogo from '../components/BrandLogoImage'

const Auth = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert(t('auth.confirmEmailAlert'))
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        navigate('/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 relative">
      <div className="absolute top-6 right-6 z-10">
        <LanguageSwitcher />
      </div>
      <div className="max-w-md w-full">
        <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-100">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200 overflow-hidden">
              <BrandLogo variant="mark" size={64} title={t('common.appName')} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isSignUp ? t('auth.createAccount') : t('auth.welcomeBack')}
            </h1>
            <p className="text-slate-400 text-sm font-medium mt-2">
              {isSignUp ? t('auth.subtitleSignUp') : t('auth.subtitleSignIn')}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs font-bold text-center py-2 animate-shake">
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? t('auth.signUp') : t('auth.signIn'))}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
            >
              {isSignUp ? t('auth.toggleToSignIn') : t('auth.toggleToSignUp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth
