import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, GripVertical, Plus, Save, Trash2, Loader2, CheckCircle, Download, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useProjectStore from '../store/projectStore'
import useAuthStore from '../store/authStore'
import { supabase } from '../lib/supabaseClient'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useI18n } from '../i18n/useI18n'

const todayIsoDate = () => new Date().toISOString().split('T')[0]

const ProjectEditor = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { t } = useI18n()
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success' | 'error' | null
  const [leftPanelWidth, setLeftPanelWidth] = useState(650)
  const [isTaskPanelCollapsed, setIsTaskPanelCollapsed] = useState(false)
  const resizeStateRef = useRef({ active: false })
  const workspaceRef = useRef(null)
  const ganttRef = useRef(null)
  const [dragState, setDragState] = useState(null)
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  const {
    projectId,
    projectTitle,
    projectStartDate,
    projectEndDate,
    totalDays,
    tasks,
    setProjectTitle,
    loadProject,
    insertTaskAt,
    reorderTasks,
    updateTask,
    deleteTask,
    saveProject
  } = useProjectStore()

  const fetchProjects = useCallback(async () => {
    if (!user) return
    setProjectsLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, tasks')
        .order('created_at', { ascending: false })
      if (!error) setProjects(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setProjectsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleProjectChange = (e) => {
    const id = e.target.value
    if (!id) {
      const t = todayIsoDate()
      useProjectStore.setState({
        projectId: null,
        projectTitle: 'New Project',
        tasks: [],
        projectStartDate: t,
        projectEndDate: t
      })
      return
    }
    const p = projects.find((x) => String(x.id) === String(id))
    if (p) loadProject(p)
  }

  const handleRowDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', String(index))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleRowDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleRowDrop = (e, dropIndex) => {
    e.preventDefault()
    const from = Number.parseInt(e.dataTransfer.getData('text/plain'), 10)
    if (Number.isNaN(from)) return
    if (from === dropIndex) return
    reorderTasks(from, dropIndex)
  }

  const calculateDuration = (start, end) => {
    const s = new Date(start)
    const e = new Date(end)
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr)
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
  }

  const timelineMeta = useMemo(() => {
    const taskStarts = tasks.map((t) => new Date(t.start))
    const taskEnds = tasks.map((t) => new Date(t.end))
    const startCandidates = [new Date(projectStartDate), ...taskStarts]
    const endCandidates = [new Date(projectEndDate), ...taskEnds]
    const minStart = new Date(Math.min(...startCandidates.map((d) => d.getTime())))
    const maxEnd = new Date(Math.max(...endCandidates.map((d) => d.getTime())))
    // Add right-side buffer so the final bar isn't flush to the screen edge.
    const bufferDays = 7
    const spanDaysRaw = Math.ceil((maxEnd - minStart) / (1000 * 60 * 60 * 24))
    const spanDays = Math.max(7, spanDaysRaw + bufferDays)
    const weeks = Math.max(1, Math.ceil(spanDays / 7))

    return { minStart, spanDays, weeks }
  }, [projectStartDate, projectEndDate, tasks])

  const timelineHeaders = useMemo(() => {
    return Array.from({ length: timelineMeta.weeks }).map((_, i) => (
      <div 
        key={i} 
        className="flex-1 border-r border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest"
      >
        {t('editor.weekLabel', { n: i + 1 })}
      </div>
    ))
  }, [timelineMeta.weeks, t])

  const gridLines = useMemo(() => {
    return Array.from({ length: timelineMeta.weeks }).map((_, i) => (
      <div key={i} className="flex-1 border-r border-slate-50" />
    ))
  }, [timelineMeta.weeks])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!resizeStateRef.current.active || isTaskPanelCollapsed) return
      const workspaceLeft = workspaceRef.current?.getBoundingClientRect().left || 0
      const rawWidth = e.clientX - workspaceLeft
      const maxAllowed = Math.min(860, Math.max(420, window.innerWidth - workspaceLeft - 360))
      const next = Math.min(maxAllowed, Math.max(420, rawWidth))
      setLeftPanelWidth(next)
    }
    const onMouseUp = () => {
      resizeStateRef.current.active = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isTaskPanelCollapsed])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragState || !ganttRef.current) return

      const rect = ganttRef.current.getBoundingClientRect()
      const chartWidth = Math.max(rect.width, 1)
      const pxDelta = e.clientX - dragState.startClientX
      const dayDelta = Math.round((pxDelta / chartWidth) * timelineMeta.spanDays)

      if (dragState.mode === 'move') {
        const nextStart = addDays(dragState.originalStart, dayDelta)
        const nextEnd = addDays(dragState.originalEnd, dayDelta)
        updateTask(dragState.taskId, 'start', nextStart)
        updateTask(dragState.taskId, 'end', nextEnd)
        setDragState((prev) => (prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : prev))
        return
      }

      if (dragState.mode === 'start') {
        const candidate = addDays(dragState.originalStart, dayDelta)
        const maxStart = dragState.originalEnd
        const nextStart = new Date(candidate) > new Date(maxStart) ? maxStart : candidate
        updateTask(dragState.taskId, 'start', nextStart)
        setDragState((prev) => (prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : prev))
        return
      }

      if (dragState.mode === 'end') {
        const candidate = addDays(dragState.originalEnd, dayDelta)
        const minEnd = dragState.originalStart
        const nextEnd = new Date(candidate) < new Date(minEnd) ? minEnd : candidate
        updateTask(dragState.taskId, 'end', nextEnd)
        setDragState((prev) => (prev ? { ...prev, clientX: e.clientX, clientY: e.clientY } : prev))
      }
    }

    const onMouseUp = () => {
      if (dragState) setDragState(null)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragState, timelineMeta.spanDays, updateTask])

  const startResizing = (e) => {
    e.preventDefault()
    resizeStateRef.current.active = true
  }

  const startTaskDrag = (e, task, mode) => {
    e.preventDefault()
    e.stopPropagation()
    setDragState({
      taskId: task.id,
      mode,
      startClientX: e.clientX,
      clientX: e.clientX,
      clientY: e.clientY,
      originalStart: task.start,
      originalEnd: task.end
    })
  }

  const resetPanelWidth = () => {
    setLeftPanelWidth(650)
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    setSaveStatus(null)

    try {
      await saveProject(user.id)
      await fetchProjects()
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
      '| # | Task | Start | End | Duration (days) |',
      '|---|------|-------|-----|------------------|',
      ...tasks.map((task, idx) => {
        const duration = calculateDuration(task.start, task.end)
        return `| ${idx + 1} | ${task.name} | ${task.start} | ${task.end} | ${duration} |`
      })
    ]
    const filename = `${makeSafeFilename(projectTitle, 'project')}.md`
    downloadTextFile(filename, lines.join('\n'), 'text/markdown;charset=utf-8')
  }

  const draggingTask = dragState ? tasks.find((t) => t.id === dragState.taskId) : null

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Editor Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="text-slate-400 hover:text-slate-600 transition-all p-2 hover:bg-slate-50 rounded-lg shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <label className="sr-only" htmlFor="project-select">{t('editor.projectSelectLabel')}</label>
          <select
            id="project-select"
            value={projectId ?? ''}
            onChange={handleProjectChange}
            disabled={projectsLoading || !user}
            className="max-w-[200px] shrink-0 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          >
            <option value="">{t('editor.unsavedProject')}</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || 'Untitled'}
              </option>
            ))}
          </select>
          <input 
            type="text" 
            value={projectTitle} 
            onChange={(e) => setProjectTitle(e.target.value)}
            className="min-w-0 flex-1 text-xl font-black text-slate-800 border-none outline-none focus:ring-2 focus:ring-indigo-100 px-2 rounded-lg bg-transparent hover:bg-slate-50 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3 flex-wrap justify-end">
          <LanguageSwitcher />
          {saveStatus === 'success' && (
            <span className="text-emerald-500 text-xs font-bold flex items-center gap-1 animate-fade-in">
              <CheckCircle size={14} /> {t('editor.saved')}
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-xs font-bold animate-fade-in">
              {t('editor.errorSaving')}
            </span>
          )}
          <button
            onClick={exportJson}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Download size={16} /> {t('editor.exportJson')}
          </button>
          <button
            onClick={exportMarkdown}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
          >
            <Download size={16} /> {t('editor.exportMd')}
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-black hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {isSaving ? t('editor.saving') : t('editor.saveProject')}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main ref={workspaceRef} className="flex-1 flex overflow-hidden">
        {/* Left: Task Table */}
        {!isTaskPanelCollapsed && (
          <div
            className="bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden"
            style={{ width: `${leftPanelWidth}px` }}
          >
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-1 w-8 text-center" aria-hidden />
                    <th className="py-3 px-1 w-8 text-center">{t('editor.colNumber')}</th>
                    <th className="py-3 px-1 w-8 text-center" aria-hidden />
                    <th className="py-3 px-2 min-w-0">{t('editor.colTaskName')}</th>
                    <th className="py-3 px-2 w-28">{t('editor.colStart')}</th>
                    <th className="py-3 px-2 w-28">{t('editor.colEnd')}</th>
                    <th className="py-3 px-2 w-14 text-center">{t('editor.colDur')}</th>
                    <th className="py-3 px-2 w-10 text-center" />
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-slate-50/60 border-b border-slate-100">
                    <td colSpan={8} className="py-2 px-2">
                      <button
                        type="button"
                        onClick={() => insertTaskAt(0)}
                        className="inline-flex items-center gap-2 text-[11px] font-black text-indigo-600 hover:text-indigo-700"
                      >
                        <Plus size={14} /> {t('editor.insertTaskAtTop')}
                      </button>
                    </td>
                  </tr>
                  {tasks.map((task, index) => {
                    const dur = calculateDuration(task.start, task.end)
                    return (
                      <tr
                        key={task.id}
                        onDragOver={handleRowDragOver}
                        onDrop={(e) => handleRowDrop(e, index)}
                        className="h-10 border-b border-slate-100 group hover:bg-slate-50/50 transition-all"
                      >
                        <td className="px-1 text-center align-middle">
                          <div
                            draggable
                            onDragStart={(e) => handleRowDragStart(e, index)}
                            className="inline-flex cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500"
                            title={t('editor.dragReorderRow')}
                          >
                            <GripVertical size={14} />
                          </div>
                        </td>
                        <td className="px-1 text-center text-[10px] font-black text-slate-300 align-middle">{index + 1}</td>
                        <td className="px-1 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => insertTaskAt(index + 1)}
                            className="inline-flex text-indigo-500 hover:text-indigo-700"
                            title={t('editor.insertTaskAfter')}
                          >
                            <Plus size={14} />
                          </button>
                        </td>
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
                          <button
                            type="button"
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
          </div>
        )}

        {/* Splitter: full-height resize track + collapse toggle centered on the divider */}
        <div className="relative w-10 shrink-0 self-stretch min-h-0 bg-slate-50 border-r border-slate-200">
          {!isTaskPanelCollapsed && (
            <div
              onMouseDown={startResizing}
              onDoubleClick={resetPanelWidth}
              className="absolute inset-y-0 left-1/2 flex w-8 -translate-x-1/2 cursor-col-resize touch-none select-none justify-center"
              title={t('editor.resizePanel')}
            >
              <div className="h-full w-1.5 rounded-full bg-slate-300 hover:bg-slate-400" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsTaskPanelCollapsed((v) => !v)}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-1/2 z-10 flex h-14 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            title={isTaskPanelCollapsed ? t('editor.expandPanel') : t('editor.collapsePanel')}
            aria-expanded={!isTaskPanelCollapsed}
            aria-label={isTaskPanelCollapsed ? t('editor.expandPanel') : t('editor.collapsePanel')}
          >
            {isTaskPanelCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {/* Right: Gantt Visualization */}
        <div ref={ganttRef} className="flex-1 bg-white overflow-hidden relative">
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
              {tasks.map((task) => {
                const dur = calculateDuration(task.start, task.end)
                const startOffset = Math.max(
                  0,
                  Math.ceil((new Date(task.start) - timelineMeta.minStart) / (1000 * 60 * 60 * 24))
                )
                const leftPercent = (startOffset / timelineMeta.spanDays) * 100
                const widthPercent = Math.max((dur / timelineMeta.spanDays) * 100, 1)

                return (
                  <div key={task.id} className="h-10 border-b border-slate-50 relative">
                    <div 
                      onMouseDown={(e) => startTaskDrag(e, task, 'move')}
                      title={t('editor.dragMove')}
                      className="h-6 rounded-lg absolute top-2 transition-all duration-300 shadow-lg bg-indigo-500 shadow-indigo-100 cursor-move flex items-center"
                      style={{ 
                        left: `${leftPercent}%`, 
                        width: `${widthPercent}%` 
                      }}
                    >
                      <button
                        onMouseDown={(e) => startTaskDrag(e, task, 'start')}
                        className="w-2 h-full rounded-l-lg bg-indigo-700/70 hover:bg-indigo-700 cursor-ew-resize shrink-0"
                        title={t('editor.dragStart')}
                      />
                      <span className="px-2 text-[10px] font-bold text-white truncate select-none">
                        {task.name}
                      </span>
                      <button
                        onMouseDown={(e) => startTaskDrag(e, task, 'end')}
                        className="w-2 h-full rounded-r-lg bg-indigo-700/70 hover:bg-indigo-700 cursor-ew-resize ml-auto shrink-0"
                        title={t('editor.dragEnd')}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          {dragState && draggingTask && (
            <div
              className="absolute z-30 pointer-events-none px-3 py-2 rounded-lg bg-slate-900 text-white text-[11px] shadow-xl"
              style={{
                left: `${dragState.clientX + 12}px`,
                top: `${dragState.clientY - 10}px`,
                transform: 'translate(-100%, -100%)'
              }}
            >
              <div className="font-bold truncate max-w-[220px]">{draggingTask.name}</div>
              <div className="text-slate-200">
                {draggingTask.start}{' -> '}{draggingTask.end}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProjectEditor
