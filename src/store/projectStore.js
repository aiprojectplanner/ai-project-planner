import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

export const FREE_PLAN_MAX_PROJECTS = 3

const addDays = (dateStr, days) => {
  const d = new Date(`${dateStr}T12:00:00`)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const renumberTaskIds = (taskList) =>
  taskList.map((t, i) => ({
    ...t,
    id: i + 1,
    dep: typeof t.dep === 'string' ? t.dep : ''
  }))

const deriveDatesFromTasks = (tasks) => {
  if (!tasks.length) {
    const t = new Date().toISOString().split('T')[0]
    return { projectStartDate: t, projectEndDate: t }
  }
  let min = tasks[0].start
  let max = tasks[0].end
  for (const x of tasks) {
    if (x.start < min) min = x.start
    if (x.end > max) max = x.end
  }
  return { projectStartDate: min, projectEndDate: max }
}

const computeInsertDates = (state, insertIndex) => {
  const { tasks, projectStartDate } = state
  const len = tasks.length

  if (len === 0) {
    const start = projectStartDate
    const end = addDays(start, 3)
    return { start, end }
  }

  if (insertIndex <= 0) {
    const nextStart = tasks[0].start
    let start = projectStartDate
    let end = addDays(start, 3)
    if (new Date(end) >= new Date(nextStart)) {
      end = addDays(nextStart, -1)
      if (new Date(end) <= new Date(start)) {
        end = addDays(start, 1)
      }
    }
    return { start, end }
  }

  if (insertIndex >= len) {
    const prevEnd = tasks[len - 1].end
    return { start: prevEnd, end: addDays(prevEnd, 3) }
  }

  const prevEnd = tasks[insertIndex - 1].end
  const nextStart = tasks[insertIndex].start
  let start = prevEnd
  let end = addDays(start, 3)
  if (new Date(end) >= new Date(nextStart)) {
    end = addDays(nextStart, -1)
    if (new Date(end) <= new Date(start)) {
      end = addDays(start, 1)
    }
  }
  return { start, end }
}

const useProjectStore = create((set, get) => ({
  projectId: null,
  projectTitle: 'Project Roadmap 2026',
  projectStartDate: '2026-03-16',
  projectEndDate: '2026-04-12',
  totalDays: 28,
  tasks: [
    { id: 1, name: 'Market Research', start: '2026-03-16', end: '2026-03-20', dep: '' },
    { id: 2, name: 'Define MVP Scope', start: '2026-03-20', end: '2026-03-25', dep: '' }
  ],
  setProjectTitle: (title) => set({ projectTitle: title }),

  saveProject: async (userId) => {
    if (!userId) throw new Error('User not authenticated')

    const { projectId, projectTitle, tasks } = get()

    const projectData = {
      user_id: userId,
      title: projectTitle,
      tasks,
      updated_at: new Date().toISOString()
    }

    let result
    if (projectId) {
      result = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId)
        .select()
    } else {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('plan_tier')
        .eq('id', userId)
        .single()

      const isPro = !profileError && profile?.plan_tier === 'pro'

      if (!isPro) {
        const { count, error: countError } = await supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)

        if (countError) throw countError
        if ((count || 0) >= FREE_PLAN_MAX_PROJECTS) {
          throw new Error('Project limit reached (Free Plan). Upgrade to Pro!')
        }
      }

      result = await supabase
        .from('projects')
        .insert(projectData)
        .select()
    }

    const { data, error } = result
    if (error) throw error

    if (data && data[0]) {
      set({ projectId: data[0].id })
    }
    return data[0]
  },

  loadProject: (project) =>
    set(() => {
      const rawTasks = Array.isArray(project.tasks) ? project.tasks : []
      const tasks = renumberTaskIds(rawTasks)
      const { projectStartDate, projectEndDate } = deriveDatesFromTasks(tasks)
      return {
        projectId: project.id,
        projectTitle: project.title || 'Untitled',
        tasks,
        projectStartDate,
        projectEndDate
      }
    }),

  insertTaskAt: (index) =>
    set((state) => {
      const insertIndex = Math.max(0, Math.min(index, state.tasks.length))
      const { start, end } = computeInsertDates(state, insertIndex)
      const newTask = {
        id: 999999,
        name: 'New Task',
        start,
        end,
        dep: ''
      }
      const merged = [...state.tasks.slice(0, insertIndex), newTask, ...state.tasks.slice(insertIndex)]
      const tasks = renumberTaskIds(merged)
      const { projectStartDate, projectEndDate } = deriveDatesFromTasks(tasks)
      return { tasks, projectStartDate, projectEndDate }
    }),

  reorderTasks: (fromIndex, toIndex) =>
    set((state) => {
      if (fromIndex === toIndex) return {}
      const arr = [...state.tasks]
      const [removed] = arr.splice(fromIndex, 1)
      arr.splice(toIndex, 0, removed)
      const tasks = renumberTaskIds(arr)
      const { projectStartDate, projectEndDate } = deriveDatesFromTasks(tasks)
      return { tasks, projectStartDate, projectEndDate }
    }),

  addTask: () => get().insertTaskAt(get().tasks.length),

  updateTask: (id, field, value) =>
    set((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { ...task, [field]: value }
          if (field === 'start' && new Date(updatedTask.end) < new Date(value)) {
            updatedTask.end = value
          }
          if (field === 'end' && new Date(value) < new Date(updatedTask.start)) {
            updatedTask.start = value
          }
          return updatedTask
        }
        return task
      })
      const { projectStartDate, projectEndDate } = deriveDatesFromTasks(newTasks)
      return { tasks: newTasks, projectStartDate, projectEndDate }
    }),

  deleteTask: (id) =>
    set((state) => {
      const newTasks = state.tasks.filter((t) => t.id !== id)
      const tasks = renumberTaskIds(newTasks)
      const { projectStartDate, projectEndDate } = deriveDatesFromTasks(tasks)
      return { tasks, projectStartDate, projectEndDate }
    }),

  importPlan: (plan) =>
    set((state) => {
      const anchorStr =
        typeof plan.projectStartDate === 'string' && plan.projectStartDate.trim()
          ? plan.projectStartDate.trim()
          : state.projectStartDate
      const tasks = plan.timeline.map((item, index) => {
        const start = new Date(`${anchorStr}T12:00:00`)
        start.setDate(start.getDate() + item.start * 7)

        const end = new Date(start)
        end.setDate(end.getDate() + item.duration * 7)

        return {
          id: index + 1,
          name: item.task,
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0],
          dep: ''
        }
      })

      const lastEnd = tasks.length ? tasks[tasks.length - 1].end : anchorStr

      return {
        projectTitle: plan.projectTitle || state.projectTitle,
        projectStartDate: anchorStr,
        projectEndDate: lastEnd,
        tasks
      }
    })
}))

export default useProjectStore
