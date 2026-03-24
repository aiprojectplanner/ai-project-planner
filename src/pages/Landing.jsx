import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const Landing = () => {
  const navigate = useNavigate()
  const [showSolutionOutput, setShowSolutionOutput] = useState(false)
  const [demoStep, setDemoStep] = useState(0)

  const solutionItems = useMemo(() => ['task list', 'timeline', 'milestones', 'roadmap'], [])

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const runSolutionPreview = () => {
    setShowSolutionOutput(false)
    setTimeout(() => setShowSolutionOutput(true), 300)
  }

  const playDemo = () => {
    setDemoStep(0)
    setTimeout(() => setDemoStep(1), 250)
    setTimeout(() => setDemoStep(2), 500)
    setTimeout(() => setDemoStep(3), 750)
    setTimeout(() => setDemoStep(4), 1000)
    setTimeout(() => setDemoStep(5), 1250)
    setTimeout(() => setDemoStep(6), 1500)
  }

  const resetDemo = () => setDemoStep(0)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="font-black tracking-tight">AI Project Planner</div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('problem')} className="hover:text-indigo-600">Problem</button>
            <button onClick={() => scrollToSection('solution')} className="hover:text-indigo-600">Solution</button>
            <button onClick={() => scrollToSection('demo')} className="hover:text-indigo-600">Demo</button>
            <button onClick={() => scrollToSection('cta')} className="hover:text-indigo-600">Start planning</button>
          </nav>
          <button
            onClick={() => navigate('/auth')}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500"
          >
            Try it free
          </button>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tight leading-tight mb-4">
            AI Project Planner
            <br />
            <span className="text-indigo-600">Turn ideas into structured project plans in minutes</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8">
            Generate tasks, timelines, and milestones automatically using AI.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800"
          >
            Try it free
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Preview</div>
          <div className="space-y-3 text-sm">
            <div className="font-bold">Idea: build AI project planner SaaS</div>
            <div className="p-3 bg-indigo-50 rounded-xl">task list</div>
            <div className="p-3 bg-indigo-50 rounded-xl">timeline</div>
            <div className="p-3 bg-indigo-50 rounded-xl">milestones</div>
          </div>
        </div>
      </section>

      <section id="problem" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-8">Planning a project is often the hardest step.</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "don't know where to start",
            'tasks are unclear',
            'timeline is unrealistic',
            'planning takes too long',
          ].map((item) => (
            <div key={item} className="bg-white border border-slate-200 rounded-2xl p-5 font-semibold hover:shadow-md transition-all">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="solution" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-8">Solution</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-sm font-bold text-slate-500 mb-2">Describe your idea:</div>
            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">build AI SaaS</div>
            <button
              onClick={runSolutionPreview}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500"
            >
              Generate
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-sm font-bold text-slate-500 mb-3">AI generates:</div>
            <div className="grid grid-cols-2 gap-3">
              {solutionItems.map((item, idx) => (
                <div
                  key={item}
                  className={`p-3 rounded-xl border font-semibold transition-all ${
                    showSolutionOutput
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 translate-y-0 opacity-100'
                      : 'bg-slate-50 border-slate-200 text-slate-400 translate-y-1 opacity-70'
                  }`}
                  style={{ transitionDelay: `${idx * 120}ms` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-8">Demo</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-sm font-bold text-slate-500 mb-2">Input:</div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">build AI project planner SaaS</div>
            <div className="mt-4 flex gap-3">
              <button onClick={playDemo} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold">Play demo</button>
              <button onClick={resetDemo} className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold">Reset demo</button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-sm font-bold text-slate-500 mb-3">Output:</div>
            <div className="space-y-4 text-sm">
              <div className={`${demoStep >= 1 ? 'opacity-100' : 'opacity-20'} transition-opacity`}>
                <div className="font-black">Phase 1</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li className={demoStep >= 1 ? 'opacity-100' : 'opacity-20'}>market research</li>
                  <li className={demoStep >= 2 ? 'opacity-100' : 'opacity-20'}>define MVP</li>
                  <li className={demoStep >= 3 ? 'opacity-100' : 'opacity-20'}>design architecture</li>
                </ul>
              </div>
              <div className={`${demoStep >= 4 ? 'opacity-100' : 'opacity-20'} transition-opacity`}>
                <div className="font-black">Phase 2</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li className={demoStep >= 4 ? 'opacity-100' : 'opacity-20'}>backend development</li>
                  <li className={demoStep >= 5 ? 'opacity-100' : 'opacity-20'}>frontend implementation</li>
                  <li className={demoStep >= 6 ? 'opacity-100' : 'opacity-20'}>testing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-slate-900 text-white p-12 text-center">
          <h2 className="text-4xl font-black mb-4">Try AI Project Planner</h2>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 font-bold"
          >
            Start planning
          </button>
        </div>
      </section>
    </div>
  )
}

export default Landing
