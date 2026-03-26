import React, { useEffect, useState } from 'react'
import { Plus, Clock, CheckCircle2, Loader2, Trash2, Pencil, Check, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import useAuthStore from '../store/authStore'
import useProjectStore from '../store/projectStore'
import { useI18n } from '../i18n/useI18n'
import BrandLogo from '../components/BrandLogoImage'

const Dashboard = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const { user } = useAuthStore()
  const { loadProject } = useProjectStore()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  const maxProjects = 3

  useEffect(() => {
    if (user) {
      fetchProjects()
    }
  }, [user])

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProjectClick = (project) => {
    loadProject(project)
    navigate('/editor')
  }

  const createNewProject = () => {
    if (projects.length >= maxProjects) {
      alert(t('dashboard.limitAlert'))
    } else {
      // Clear current project state before navigating to editor
      useProjectStore.setState({ projectId: null, projectTitle: "New Project", tasks: [] })
      navigate('/editor')
    }
  }

  const deleteProject = async (e, id) => {
    e.stopPropagation() // Prevent navigating to editor
    if (!confirm(t('dashboard.deleteConfirm'))) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setProjects(projects.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting project:', error)
      alert(t('dashboard.deleteFailed'))
    }
  }

  const startRename = (e, project) => {
    e.stopPropagation()
    setEditingProjectId(project.id)
    setEditingTitle(project.title || '')
  }

  const cancelRename = (e) => {
    e.stopPropagation()
    setEditingProjectId(null)
    setEditingTitle('')
  }

  const submitRename = async (e, projectId) => {
    e.stopPropagation()
    const nextTitle = editingTitle.trim()
    if (!nextTitle) {
      alert(t('dashboard.titleEmpty'))
      return
    }

    try {
      const { error } = await supabase
        .from('projects')
        .update({ title: nextTitle, updated_at: new Date().toISOString() })
        .eq('id', projectId)

      if (error) throw error

      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, title: nextTitle } : p))
      )
      setEditingProjectId(null)
      setEditingTitle('')
    } catch (error) {
      console.error('Error renaming project:', error)
      alert(t('dashboard.renameFailed'))
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            {t('dashboard.freePlanUsage', { current: projects.length, max: maxProjects })}
          </p>
        </div>
        <button 
          onClick={createNewProject}
          className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
        >
          <Plus size={18} /> {t('dashboard.newProject')}
        </button>
      </div>

      {/* AI Promotion Banner */}
      <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-16 h-16 bg-transparent rounded-2xl flex items-center justify-center text-2xl border border-white/10 backdrop-blur-sm shrink-0 overflow-hidden">
            <BrandLogo variant="mark" size={64} title={t('common.appName')} />
          </div>
          <div>
            <h3 className="text-white text-xl font-black tracking-tight mb-1">{t('dashboard.aiBannerTitle')}</h3>
            <p className="text-slate-400 text-sm font-medium max-w-md">{t('dashboard.aiBannerBody')}</p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/ai-planner')}
          className="relative z-10 px-8 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-xs uppercase tracking-widest backdrop-blur-sm"
        >
          {t('dashboard.startAi')}
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <h2 className="col-span-full font-black text-xs text-slate-400 uppercase tracking-widest mb-2">{t('dashboard.myProjects')}</h2>
        
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500" size={48} />
          </div>
        ) : (
          <>
            {projects.map((project) => (
              <div 
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group flex flex-col h-full relative"
              >
                <button 
                  onClick={(e) => deleteProject(e, project.id)}
                  className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                {editingProjectId !== project.id && (
                  <button
                    onClick={(e) => startRename(e, project)}
                    className="absolute top-6 right-16 p-2 text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title={t('dashboard.rename')}
                  >
                    <Pencil size={16} />
                  </button>
                )}

                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-sm font-black border border-indigo-100 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0 uppercase">
                  {project.title.substring(0, 2)}
                </div>
                {editingProjectId === project.id ? (
                  <div className="mb-2 pr-8" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <input
                        autoFocus
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') submitRename(e, project.id)
                          if (e.key === 'Escape') cancelRename(e)
                        }}
                        className="w-full text-sm font-bold text-slate-800 border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                      />
                      <button
                        onClick={(e) => submitRename(e, project.id)}
                        className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50"
                        title={t('dashboard.save')}
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={cancelRename}
                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                        title={t('dashboard.cancel')}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3 className="font-black text-slate-900 text-lg mb-2 truncate pr-8">{project.title}</h3>
                )}
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Clock size={10} /> {new Date(project.created_at).toLocaleDateString()}
                </p>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex -space-x-3">
                    <img src={`https://ui-avatars.com/api/?name=${user?.email}&background=random`} className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
                  </div>
                  <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={8} /> {t('dashboard.active')}
                  </span>
                </div>
              </div>
            ))}

            {/* Add New Placeholder */}
            <div 
              onClick={createNewProject}
              className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 hover:bg-white hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer group h-full min-h-[280px]"
            >
              <div className="w-16 h-16 bg-white text-slate-300 rounded-full flex items-center justify-center mb-6 group-hover:text-indigo-500 shadow-sm transition-all shrink-0">
                <Plus size={24} />
              </div>
              <p className="text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-all uppercase tracking-widest">{t('dashboard.createNew')}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
