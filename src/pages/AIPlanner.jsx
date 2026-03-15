import React, { useState } from 'react'
import { Sparkles, ArrowLeft, Send, Loader2, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '../store/projectStore'

const AIPlanner = () => {
  const navigate = useNavigate()
  const importPlan = useProjectStore(state => state.importPlan)
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!idea.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate plan.')
      }

      importPlan(data)
      navigate('/editor')
    } catch (err) {
      console.error('Error generating plan:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white p-12 md:p-16 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -ml-16 -mb-16"></div>

          <div className="relative z-10">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl shadow-sm border border-indigo-100">
              <Sparkles size={32} />
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">AI Project Planner</h1>
            <p className="text-slate-500 text-sm font-medium mb-8">
              Describe your project idea and let AI create a roadmap for you.
            </p>

            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="relative">
                <textarea 
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Example: Build a mobile app for plant care with AI diagnosis..."
                  className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-medium focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all resize-none"
                  disabled={loading}
                />
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
                  onClick={() => navigate('/')} 
                  className="px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  <ArrowLeft size={18} /> Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[160px]"
                  disabled={loading || !idea.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Generate Roadmap
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <p className="mt-8 text-slate-400 text-xs font-black uppercase tracking-widest">Powered by OpenRouter AI</p>
      </div>
    </div>
  )
}

export default AIPlanner
