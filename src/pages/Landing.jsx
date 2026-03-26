import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n/useI18n'
import { getLandingDemos, messages } from '../i18n/messages'
import BrandLogo from '../components/BrandLogoImage'

const Landing = () => {
  const navigate = useNavigate()
  const { locale, t } = useI18n()
  const [showSolutionOutput, setShowSolutionOutput] = useState(false)
  const [demoStep, setDemoStep] = useState(0)
  const [activeDemoKey, setActiveDemoKey] = useState('saas')
  const [copyNotice, setCopyNotice] = useState(false)

  const demos = useMemo(() => getLandingDemos(locale), [locale])
  const solutionItems = useMemo(
    () => messages[locale]?.landing?.solutionItems || messages.en.landing.solutionItems,
    [locale]
  )

  const activeDemo = useMemo(
    () => demos.find((d) => d.key === activeDemoKey) || demos[0],
    [demos, activeDemoKey]
  )

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
  const switchDemo = (nextKey) => {
    setActiveDemoKey(nextKey)
    setDemoStep(0)
  }

  const copyDemoInput = async () => {
    try {
      await navigator.clipboard.writeText(activeDemo.input)
      setCopyNotice(true)
      setTimeout(() => setCopyNotice(false), 1500)
    } catch (_err) {
      setCopyNotice(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center border border-slate-200 overflow-hidden">
              <BrandLogo variant="mark" size={40} title={t('common.appName')} />
            </div>
            <div className="font-black tracking-tight">{t('common.appName')}</div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <button type="button" onClick={() => scrollToSection('problem')} className="hover:text-indigo-600">
              {t('landing.navProblem')}
            </button>
            <button type="button" onClick={() => scrollToSection('solution')} className="hover:text-indigo-600">
              {t('landing.navSolution')}
            </button>
            <button type="button" onClick={() => scrollToSection('demo')} className="hover:text-indigo-600">
              {t('landing.navDemo')}
            </button>
            <button type="button" onClick={() => scrollToSection('cta')} className="hover:text-indigo-600">
              {t('landing.navCta')}
            </button>
          </nav>
          <div className="flex items-center gap-3 shrink-0">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500"
            >
              {t('landing.tryFree')}
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-5xl font-black tracking-tight leading-tight mb-4">
            {t('landing.heroLine1')}
            <br />
            <span className="text-indigo-600">{t('landing.heroLine2')}</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8">{t('landing.heroSub')}</p>
          <p className="text-sm font-semibold text-slate-500 mb-6">{t('landing.heroTrust')}</p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800"
          >
            {t('landing.tryFree')}
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xl">
          <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">{t('landing.preview')}</div>
          <div className="space-y-3 text-sm">
            <div className="font-bold">{t('landing.previewIdeaLabel')}</div>
            <div className="p-3 bg-indigo-50 rounded-xl">{solutionItems[0]}</div>
            <div className="p-3 bg-indigo-50 rounded-xl">{solutionItems[1]}</div>
            <div className="p-3 bg-indigo-50 rounded-xl">{solutionItems[2]}</div>
          </div>
        </div>
      </section>

      <section id="problem" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-8">{t('landing.problemTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {(messages[locale]?.landing?.problems || messages.en.landing.problems).map((item) => (
            <div
              key={item}
              className="bg-white border border-slate-200 rounded-2xl p-5 font-semibold hover:shadow-md transition-all"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="solution" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black mb-8">{t('landing.solutionTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-sm font-bold text-slate-500 mb-2">{t('landing.describeIdea')}</div>
            <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">{t('landing.ideaSample')}</div>
            <button
              type="button"
              onClick={runSolutionPreview}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500"
            >
              {t('landing.generate')}
            </button>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-sm font-bold text-slate-500 mb-3">{t('landing.aiGenerates')}</div>
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
        <h2 className="text-3xl font-black mb-8">{t('landing.demoTitle')}</h2>
        <div className="flex flex-wrap gap-3 mb-6">
          {demos.map((demo) => (
            <button
              key={demo.key}
              type="button"
              onClick={() => switchDemo(demo.key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                activeDemo.key === demo.key
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
              }`}
            >
              {demo.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-500 mb-2">{activeDemo.title}</div>
            <div className="text-sm font-bold text-slate-500 mb-2">{t('landing.input')}</div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">{activeDemo.input}</div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={playDemo} className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold">
                {t('landing.playDemo')}
              </button>
              <button type="button" onClick={resetDemo} className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold">
                {t('landing.resetDemo')}
              </button>
              <button type="button" onClick={copyDemoInput} className="px-4 py-2 rounded-xl bg-white border border-slate-300 font-bold">
                {copyNotice ? t('landing.copied') : t('landing.copyInput')}
              </button>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="text-sm font-bold text-slate-500 mb-3">{t('landing.output')}</div>
            <div className="space-y-4 text-sm">
              <div className={`${demoStep >= 1 ? 'opacity-100' : 'opacity-20'} transition-opacity`}>
                <div className="font-black">{t('landing.phase1')}</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li className={demoStep >= 1 ? 'opacity-100' : 'opacity-20'}>{activeDemo.phase1[0]}</li>
                  <li className={demoStep >= 2 ? 'opacity-100' : 'opacity-20'}>{activeDemo.phase1[1]}</li>
                  <li className={demoStep >= 3 ? 'opacity-100' : 'opacity-20'}>{activeDemo.phase1[2]}</li>
                </ul>
              </div>
              <div className={`${demoStep >= 4 ? 'opacity-100' : 'opacity-20'} transition-opacity`}>
                <div className="font-black">{t('landing.phase2')}</div>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li className={demoStep >= 4 ? 'opacity-100' : 'opacity-20'}>{activeDemo.phase2[0]}</li>
                  <li className={demoStep >= 5 ? 'opacity-100' : 'opacity-20'}>{activeDemo.phase2[1]}</li>
                  <li className={demoStep >= 6 ? 'opacity-100' : 'opacity-20'}>{activeDemo.phase2[2]}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cta" className="max-w-6xl mx-auto px-6 py-20">
        <div className="rounded-3xl bg-slate-900 text-white p-12 text-center">
          <h2 className="text-4xl font-black mb-4">{t('landing.ctaTitle')}</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="px-8 py-3 rounded-2xl bg-indigo-500 hover:bg-indigo-400 font-bold"
            >
              {t('landing.startPlanning')}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('demo')}
              className="px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold"
            >
              {t('landing.viewDemos')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Landing
