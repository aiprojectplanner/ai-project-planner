import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, Navigate } from 'react-router-dom'
import { LayoutDashboard, GanttChart, Wand2, BarChart, Bell, LogOut, Loader2, CreditCard, CalendarDays } from 'lucide-react'

import Dashboard from './pages/Dashboard'
import ProjectEditor from './pages/ProjectEditor'
import AIPlanner from './pages/AIPlanner'
import Calendar from './pages/Calendar'
import Landing from './pages/Landing'
import Pricing from './pages/Pricing'
import Auth from './pages/Auth'
import useAuthStore from './store/authStore'
import LanguageSwitcher from './components/LanguageSwitcher'
import { useI18n } from './i18n/useI18n'
import BrandLogo from './components/BrandLogoImage'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-indigo-600">
        <Loader2 className="animate-spin" size={48} />
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />
  }
  
  return children
}

const PageHeader = () => {
  const location = useLocation()
  const { signOut } = useAuthStore()
  const { t } = useI18n()

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return t('header.dashboard')
      case '/editor':
        return t('header.editor')
      case '/ai-planner':
        return t('header.aiPlanner')
      case '/calendar':
        return t('header.calendar')
      case '/pricing':
        return t('header.pricing')
      default:
        return t('header.dashboard')
    }
  }

  // Only show the standard header for Dashboard and AI Planner (Editor has its own header)
  const { user } = useAuthStore()
  if (!user || location.pathname === '/editor' || location.pathname === '/auth') return null

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10">
      <h2 className="font-bold text-slate-800 uppercase tracking-wider text-sm">{getPageTitle()}</h2>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full transition-all">
          <Bell size={20} />
        </button>
        <div className="h-8 w-[1px] bg-slate-200"></div>
        <button 
          onClick={signOut}
          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-red-500 rounded-full transition-all"
          title={t('header.signOut')}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  )
}

const App = () => {
  const { initialize, user } = useAuthStore()
  const { t } = useI18n()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      <div className="flex h-screen overflow-hidden font-inter bg-slate-50">
        {/* Sidebar - Hidden on Auth Page */}
        {user && <aside className="w-64 bg-slate-900 flex flex-col shrink-0 text-slate-300">
          <div className="p-6 flex items-center gap-3 border-b border-slate-800">
            <div className="w-10 h-10 bg-transparent rounded-xl flex items-center justify-center border border-slate-800 overflow-hidden">
              <BrandLogo variant="mark" size={40} title={t('common.appName')} />
            </div>
            <h1 className="font-bold text-lg tracking-tight text-white">{t('common.appName')}</h1>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} className="text-slate-500 group-[.active]:text-indigo-400" />
              <span className="font-medium text-sm">{t('nav.dashboard')}</span>
            </NavLink>
            <NavLink to="/editor" className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}>
              <GanttChart size={20} className="text-slate-500 group-[.active]:text-indigo-400" />
              <span className="font-medium text-sm">{t('nav.editor')}</span>
            </NavLink>
            <NavLink to="/ai-planner" className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}>
              <Wand2 size={20} className="text-slate-500 group-[.active]:text-indigo-400" />
              <span className="font-medium text-sm">{t('nav.aiPlanner')}</span>
            </NavLink>
            <NavLink to="/calendar" className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}>
              <CalendarDays size={20} className="text-slate-500 group-[.active]:text-indigo-400" />
              <span className="font-medium text-sm">{t('nav.calendar')}</span>
            </NavLink>
            <NavLink to="/pricing" className={({ isActive }) => `nav-item group ${isActive ? 'active' : ''}`}>
              <CreditCard size={20} className="text-slate-500 group-[.active]:text-indigo-400" />
              <span className="font-medium text-sm">{t('nav.pricing')}</span>
            </NavLink>
            <div className="nav-item opacity-50 cursor-not-allowed">
              <BarChart size={20} className="text-slate-500" />
              <span className="font-medium text-sm">{t('nav.analytics')}</span>
            </div>
          </nav>

          <div className="px-4 pb-2">
            <LanguageSwitcher className="w-full justify-center" />
          </div>

          <div className="p-4 border-t border-slate-800 mt-auto">
            <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl">
              <img 
                src={`https://ui-avatars.com/api/?name=${user?.email}&background=6366f1&color=fff`} 
                className="w-10 h-10 rounded-lg border border-slate-700" 
                alt="Avatar" 
              />
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user?.email?.split('@')[0]}</div>
                <div className="text-[10px] text-slate-500 truncate">{t('sidebar.accountBadge')}</div>
              </div>
            </div>
          </div>
        </aside>}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 relative">
          <PageHeader />
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/editor" element={<ProtectedRoute><ProjectEditor /></ProtectedRoute>} />
              <Route path="/ai-planner" element={<ProtectedRoute><AIPlanner /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
              <Route path="/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  )
}

export default App
