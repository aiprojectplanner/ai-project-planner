import React, { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import useAuthStore from '../store/authStore'
import { useI18n } from '../i18n/useI18n'

const VIEWS = ['day', 'week', 'month']
const WEEKDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TASK_COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
]

const toIso = (d) => d.toISOString().split('T')[0]
const fromIso = (s) => new Date(`${s}T12:00:00`)
const addDays = (d, n) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
const startOfWeek = (d) => {
  const x = new Date(d)
  const day = x.getDay()
  const delta = day === 0 ? -6 : 1 - day
  x.setDate(x.getDate() + delta)
  return x
}
const endOfWeek = (d) => addDays(startOfWeek(d), 6)
const startOfMonthGrid = (d) => startOfWeek(new Date(d.getFullYear(), d.getMonth(), 1, 12))
const sameDay = (a, b) => toIso(a) === toIso(b)

const CalendarPage = () => {
  const { t } = useI18n()
  const { user } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectIds, setSelectedProjectIds] = useState([])
  const [view, setView] = useState('week')
  const [cursorDate, setCursorDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!user?.id) return
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title, tasks, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (!cancelled && !error) {
          const list = data || []
          setProjects(list)
          setSelectedProjectIds((prev) => {
            if (prev.length) return prev
            return list[0]?.id ? [String(list[0].id)] : []
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const selectedProjects = useMemo(
    () => projects.filter((p) => selectedProjectIds.includes(String(p.id))),
    [projects, selectedProjectIds]
  )

  const tasks = useMemo(() => {
    let colorIndex = 0
    const out = []
    for (const project of selectedProjects) {
      const raw = Array.isArray(project?.tasks) ? project.tasks : []
      for (let i = 0; i < raw.length; i += 1) {
        const task = raw[i]
        if (!task?.start || !task?.end) continue
        out.push({
          id: `${project.id}-${task.id ?? i + 1}-${i}`,
          name: task.name || `Task ${i + 1}`,
          projectTitle: project.title || 'Untitled',
          start: task.start,
          end: task.end,
          colorClass: TASK_COLORS[colorIndex % TASK_COLORS.length],
        })
        colorIndex += 1
      }
    }
    return out
  }, [selectedProjects])

  const dayEvents = useMemo(() => {
    const out = []
    for (const task of tasks) {
      let cur = fromIso(task.start)
      const end = fromIso(task.end)
      while (cur <= end) {
        out.push({
          taskId: task.id,
          taskName: task.name,
          projectTitle: task.projectTitle,
          date: toIso(cur),
          colorClass: task.colorClass,
        })
        cur = addDays(cur, 1)
      }
    }
    return out
  }, [tasks])

  const eventsByDate = useMemo(() => {
    const map = new Map()
    for (const e of dayEvents) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date).push(e)
    }
    return map
  }, [dayEvents])

  const visibleDates = useMemo(() => {
    if (view === 'day') return [new Date(cursorDate)]
    if (view === 'week') {
      const s = startOfWeek(cursorDate)
      return Array.from({ length: 7 }, (_, i) => addDays(s, i))
    }
    const s = startOfMonthGrid(cursorDate)
    return Array.from({ length: 42 }, (_, i) => addDays(s, i))
  }, [view, cursorDate])

  const moveCursor = (delta) => {
    if (view === 'day') setCursorDate((d) => addDays(d, delta))
    else if (view === 'week') setCursorDate((d) => addDays(d, delta * 7))
    else setCursorDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1, 12))
  }

  const goToday = () => {
    const now = new Date()
    setCursorDate(now)
    setSelectedDate(now)
  }

  const toggleProject = (projectId) => {
    const key = String(projectId)
    setSelectedProjectIds((prev) => {
      if (prev.includes(key)) return prev.filter((x) => x !== key)
      return [...prev, key]
    })
  }

  const rangeLabel = useMemo(() => {
    if (view === 'day') return cursorDate.toLocaleDateString()
    if (view === 'week') {
      const s = startOfWeek(cursorDate)
      const e = endOfWeek(cursorDate)
      return `${s.toLocaleDateString()} - ${e.toLocaleDateString()}`
    }
    return `${cursorDate.getFullYear()}-${String(cursorDate.getMonth() + 1).padStart(2, '0')}`
  }, [view, cursorDate])

  const selectedIso = toIso(selectedDate)
  const activeDayEvents = eventsByDate.get(selectedIso) || []

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <CalendarDays size={20} className="text-indigo-600 shrink-0" />
            <div className="min-w-[280px]">
              <div className="text-[11px] font-black text-slate-500 mb-1">{t('calendar.projectPicker')}</div>
              <div className="flex flex-wrap gap-2">
                {projects.map((p) => {
                  const active = selectedProjectIds.includes(String(p.id))
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProject(p.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {p.title}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {VIEWS.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  view === v
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t(`calendar.view.${v}`)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => moveCursor(-1)}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-3 text-sm font-bold text-slate-700 min-w-[210px] text-center">{rangeLabel}</div>
            <button
              type="button"
              onClick={() => moveCursor(1)}
              className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={goToday}
              className="px-3 h-9 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50"
            >
              {t('calendar.today')}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
            {t('calendar.selectedProjects')}: {selectedProjects.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
            {t('calendar.totalTasks')}: {tasks.length}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-bold">
            {t('calendar.totalDays')}: {eventsByDate.size}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
          {t('calendar.loading')}
        </div>
      ) : selectedProjects.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-500">
          {t('calendar.emptyProject')}
        </div>
      ) : (
        <div className="grid xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3 bg-white border border-slate-200 rounded-3xl p-4">
            {view === 'month' && (
              <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAY.map((w) => (
                  <div key={w} className="text-center text-[11px] font-black text-slate-400 uppercase">
                    {w}
                  </div>
                ))}
              </div>
            )}
            <div
              className={`grid gap-2 ${
                view === 'day' ? 'grid-cols-1' : view === 'week' ? 'grid-cols-7' : 'grid-cols-7'
              }`}
            >
              {visibleDates.map((d) => {
                const iso = toIso(d)
                const items = eventsByDate.get(iso) || []
                const inCurrentMonth = d.getMonth() === cursorDate.getMonth()
                const selected = iso === selectedIso
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => setSelectedDate(d)}
                    className={`text-left rounded-2xl border p-3 min-h-[120px] transition-colors ${
                      selected
                        ? 'border-indigo-400 bg-indigo-50/60'
                        : sameDay(d, new Date())
                        ? 'border-indigo-300 bg-indigo-50/40'
                        : 'border-slate-100 bg-slate-50/50'
                    } ${view === 'month' && !inCurrentMonth ? 'opacity-45' : ''}`}
                  >
                    <div className="text-[11px] font-black text-slate-500 mb-2">{iso}</div>
                    <div className="space-y-1">
                      {items.slice(0, 3).map((e) => (
                        <div
                          key={`${e.taskId}-${e.date}-${e.taskName}`}
                          className={`px-2 py-1 rounded-lg text-[11px] font-bold truncate ${e.colorClass}`}
                        >
                          {e.taskName}
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="text-[10px] font-bold text-slate-500">
                          +{items.length - 3} {t('calendar.more')}
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-5">
            <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              {t('calendar.sideTitle')}
            </div>
            <div className="text-sm font-bold text-slate-700 mb-4">{selectedIso}</div>
            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {activeDayEvents.length === 0 ? (
                <div className="text-xs text-slate-500">{t('calendar.noTasks')}</div>
              ) : (
                activeDayEvents.map((e, i) => (
                  <div key={`${e.taskId}-${i}`} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-500 mb-1">{e.projectTitle}</div>
                    <div className={`inline-block px-2 py-1 rounded-lg text-[11px] font-bold mb-2 ${e.colorClass}`}>
                      {e.taskName}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500">{selectedIso}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarPage

