import React, { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Save, Trash2, Loader2, CheckCircle, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '../store/projectStore'
import useAuthStore from '../store/authStore'

const ProjectEditor = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success' | 'error' | null

  const { 
    projectTitle, 
    projectStartDate, 
    projectEndDate,
    totalDays, 
    tasks, 
    setProjectTitle, 
    addTask, 
    updateTask, 
    deleteTask,
    saveProject
  } = useProjectStore()

  const calculateDuration = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const timelineHeaders = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => (
      <div 
        key={i} 
        className="flex-1 border-r border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest"
      >
        Week {i + 1}
      </div>
    ))
  }, [])

  const gridLines = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex-1 border-r border-slate-50" />
    ))
  }, [])

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setSaveStatus(null)

    try {
      await saveProject(user.id)
      setSaveStatus('success')
      setTimeout(() => setSaveStatus(null), 3000)
    } catch (error) {
      console.error('Error saving project:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const makeSafeFilename = (value, fallback) => {
    const base = (value || '').trim() || fallback
    return base.replace(/[^\w.-]+/g, '_')
  }

  const downloadTextFile = (filename, content, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportJson = () => {
    const payload = {
      projectTitle,
      projectStartDate,
      projectEndDate,
      totalDays,
      tasks
    }
    const filename = `${makeSafeFilename(projectTitle, 'project')}.json`
    downloadTextFile(filename, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
  }

  const exportMarkdown = () => {
    const lines = [
      `# ${projectTitle || 'Project'}`,
      '',
      `- Start Date: ${projectStartDate}`,
      `- End Date: ${projectEndDate}`,
      `- Total Days: ${totalDays}`,
      '',
      '## Tasks',
      '',
      '| # | Task | Start | End | Duration (days) | Dependency |',
      '|---|------|-------|-----|------------------|------------|',
      ...tasks.map((task, idx) => {
        const duration = calculateDuration(task.start, task.end)
        return `| ${idx + 1} | ${task.name} | ${task.start} | ${task.end} | ${duration} | ${task.dep || '-'} |`
      })
    ]
    const filename = `${makeSafeFilename(projectTitle, 'project')}.md`
    downloadTextFile(filename, lines.join('\n'), 'text/markdown;charset=utf-8')
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Editor Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="text-slate-400 hover:text-slate-600 transition-all p-2 hover:bg-slate-50 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <input 
            type="text" 
            value={projectTitle} 
            onChange={(e) => setProjectTitle(e.target.value)}
            className="text-xl font-black text-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-100 px-2 rounded-lg bg-transparent hover:bg-slate-50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && (
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 animate-fade-in">
              <CheckCircle size={14} /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-xs font-bold animate-fade-in">
              Error saving
            </span>
          )}
          <button 
            onClick={addTask} 
            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Add Task
          </button>
          <button
            onClick={exportJson}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export JSON
          </button>
          <button
            onClick={exportMarkdown}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export MD
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Task Table */}
        <div className="w-[650px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4 w-10">#</th>
                <th className="py-3 px-2 w-40">Task Name</th>
                <th className="py-3 px-2 w-32">Start Date</th>
                <th className="py-3 px-2 w-32">End Date</th>
                <th className="py-3 px-2 w-20 text-center">Dur</th>
                <th className="py-3 px-2 w-20 text-center">Dep</th>
                <th className="py-3 px-2 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const dur = calculateDuration(task.start, task.end)
                return (
                  <tr key={task.id} className="h-10 border-bottom border-slate-100 group hover:bg-slate-50/50 transition-all">
                    <td className="px-4 text-[10px] font-black text-slate-300">{task.id}</td>
                    <td className="px-2">
                      <input 
                        type="text" 
                        value={task.name} 
                        onChange={(e) => updateTask(task.id, 'name', e.target.value)}
                        className="w-full bg-transparent text-xs font-semibold px-2 py-1 focus:outline-2 focus:outline-indigo-500 focus:bg-white rounded"
                      />
                    </td>
                    <td className="px-2">
                      <input 
                        type="date" 
                        value={task.start} 
                        onChange={(e) => updateTask(task.id, 'start', e.target.value)}
                        className="w-full bg-transparent text-[11px] font-medium text-slate-500 cursor-pointer focus:outline-1 focus:outline-slate-200 focus:bg-white rounded"
                      />
                    </td>
                    <td className="px-2">
                      <input 
                        type="date" 
                        value={task.end} 
                        onChange={(e) => updateTask(task.id, 'end', e.target.value)}
                        className="w-full bg-transparent text-[11px] font-medium text-slate-500 cursor-pointer focus:outline-1 focus:outline-slate-200 focus:bg-white rounded"
                      />
                    </td>
                    <td className="px-2 text-center text-[11px] font-bold text-slate-400">{dur}d</td>
                    <td className="px-2 text-center">
                      <input 
                        type="text" 
                        value={task.dep} 
                        onChange={(e) => updateTask(task.id, 'dep', e.target.value)}
                        placeholder="-"
                        className="w-full bg-transparent text-xs font-semibold text-center text-indigo-500 focus:outline-2 focus:outline-indigo-500 focus:bg-white rounded"
                      />
                    </td>
                    <td className="px-2 text-center">
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Right: Gantt Visualization */}
        <div className="flex-1 bg-white overflow-x-auto relative min-w-[800px]">
          {/* Timeline Header */}
          <div className="h-10 bg-slate-50 border-b border-slate-200 flex sticky top-0 z-10">
            {timelineHeaders}
          </div>

          {/* Gantt Bars Container */}
          <div className="relative min-h-full">
            {/* Vertical grid lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {gridLines}
            </div>
            {/* Bars */}
            <div className="relative">
              {tasks.map((task, index) => {
                const dur = calculateDuration(task.start, task.end)
                const startOffset = calculateDuration(projectStartDate, task.start)
                const leftPercent = (startOffset / totalDays) * 100
                const widthPercent = (dur / totalDays) * 100

                return (
                  <div key={task.id} className="h-10 border-b border-slate-50 relative">
                    <div 
                      className={`h-6 rounded-lg absolute top-2 transition-all duration-300 shadow-lg ${
                        index % 2 === 0 
                        ? 'bg-indigo-500 shadow-indigo-100' 
                        : 'bg-emerald-500 shadow-emerald-100'
                      }`}
                      style={{ 
                        left: `${leftPercent}%`, 
                        width: `${widthPercent}%` 
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectEditor
