import { create } from 'zustand'

const useProjectStore = create((set) => ({
  projectTitle: "Project Roadmap 2026",
  projectStartDate: '2026-03-16',
  projectEndDate: '2026-04-12',
  totalDays: 28,
  tasks: [
    { id: 1, name: "Market Research", start: "2026-03-16", end: "2026-03-20", dep: "" },
    { id: 2, name: "Define MVP Scope", start: "2026-03-20", end: "2026-03-25", dep: "1" }
  ],
  setProjectTitle: (title) => set({ projectTitle: title }),
  addTask: () => set((state) => {
    const lastTask = state.tasks[state.tasks.length - 1]
    const newStart = lastTask ? lastTask.end : state.projectStartDate
    
    const endDate = new Date(newStart)
    endDate.setDate(endDate.getDate() + 3)
    const newEnd = endDate.toISOString().split('T')[0]

    return {
      tasks: [
        ...state.tasks,
        {
          id: state.tasks.length + 1,
          name: "New Task",
          start: newStart,
          end: newEnd,
          dep: ""
        }
      ]
    }
  }),
  updateTask: (id, field, value) => set((state) => {
    const newTasks = state.tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, [field]: value }
        // Ensure end date is not before start date
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
    return { tasks: newTasks }
  }),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  importPlan: (plan) => set((state) => {
    // Convert AI plan to our internal format
    const tasks = plan.timeline.map((item, index) => {
      const start = new Date(state.projectStartDate)
      start.setDate(start.getDate() + (item.start * 7)) // item.start is in weeks
      
      const end = new Date(start)
      end.setDate(end.getDate() + (item.duration * 7))
      
      return {
        id: index + 1,
        name: item.task,
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        dep: ""
      }
    })
    
    return {
      projectTitle: plan.projectTitle || state.projectTitle,
      tasks: tasks
    }
  })
}))

export default useProjectStore
