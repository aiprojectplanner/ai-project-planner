import React from 'react'
import { Plus, Brain, Users, Clock, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()
  const projectCount = 2
  const maxProjects = 3

  const createNewProject = () => {
    if (projectCount >= maxProjects) {
      alert("Project limit reached (Free Plan). Upgrade to Pro!")
    } else {
      navigate('/editor')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
            Free Plan · {projectCount}/{maxProjects} Projects Used
          </p>
        </div>
        <button 
          onClick={createNewProject}
          className="px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
        >
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* AI Promotion Banner */}
      <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
          <div className="w-16 h-16 bg-white/10 text-indigo-400 rounded-2xl flex items-center justify-center text-2xl border border-white/10 backdrop-blur-sm shrink-0">
            <Brain size={32} />
          </div>
          <div>
            <h3 className="text-white text-xl font-black tracking-tight mb-1">Generate Project with AI</h3>
            <p className="text-slate-400 text-sm font-medium max-w-md">
              Coming soon for Pro users. Describe your idea and get a full roadmap.
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/ai-planner')}
          className="relative z-10 px-8 py-3 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all text-xs uppercase tracking-widest backdrop-blur-sm"
        >
          Learn More
        </button>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <h2 className="col-span-full font-black text-xs text-slate-400 uppercase tracking-widest mb-2">My Projects</h2>
        
        {/* Project Card 1 */}
        <div 
          onClick={() => navigate('/editor')}
          className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group flex flex-col h-full"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 text-sm font-black border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">MA</div>
          <h3 className="font-black text-slate-900 text-lg mb-2">Mobile App MVP</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Clock size={10} /> Updated 2h ago · 8 weeks
          </p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex -space-x-3">
              <img src="https://ui-avatars.com/api/?name=U1&background=random" className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
              <img src="https://ui-avatars.com/api/?name=U2&background=random" className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
            </div>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 size={8} /> Active
            </span>
          </div>
        </div>

        {/* Project Card 2 */}
        <div 
          onClick={() => navigate('/editor')}
          className="bg-white p-8 rounded-3xl border border-slate-200 hover:shadow-2xl hover:border-indigo-200 transition-all cursor-pointer group flex flex-col h-full"
        >
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mb-6 text-sm font-black border border-indigo-100 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">MC</div>
          <h3 className="font-black text-slate-900 text-lg mb-2">Marketing Campaign</h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <Clock size={10} /> Updated 1d ago · 4 weeks
          </p>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex -space-x-3">
              <img src="https://ui-avatars.com/api/?name=U3&background=random" className="w-8 h-8 rounded-full border-2 border-white" alt="Avatar" />
            </div>
            <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1">
              <Plus size={8} /> Planning
            </span>
          </div>
        </div>

        {/* Add New Placeholder */}
        <div 
          onClick={createNewProject}
          className="bg-slate-100/50 border-2 border-dashed border-slate-200 rounded-[40px] flex flex-col items-center justify-center p-12 hover:bg-white hover:border-indigo-200 hover:shadow-xl transition-all cursor-pointer group h-full"
        >
          <div className="w-16 h-16 bg-white text-slate-300 rounded-full flex items-center justify-center mb-6 group-hover:text-indigo-500 shadow-sm transition-all shrink-0">
            <Plus size={24} />
          </div>
          <p className="text-xs font-black text-slate-400 group-hover:text-indigo-600 transition-all uppercase tracking-widest">Create New Project</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
