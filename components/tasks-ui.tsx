'use client'

import { useState } from 'react'

type Task = {
  id: number
  title: string
  status: 'pending' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
}

export default function TasksUI() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Follow-up with Lead A', status: 'pending', priority: 'high', dueDate: '2026-02-05' },
    { id: 2, title: 'Send Proposal to Client B', status: 'completed', priority: 'medium', dueDate: '2026-02-03' },
    { id: 3, title: 'Call Lead C', status: 'pending', priority: 'urgent', dueDate: '2026-02-06' }
  ])
  const [newTask, setNewTask] = useState('')

  const addTask = () => {
    if (!newTask) return
    setTasks(prev => [
      ...prev,
      { id: prev.length + 1, title: newTask, status: 'pending', priority: 'medium', dueDate: new Date().toISOString().split('T')[0] }
    ])
    setNewTask('')
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="New task"
          className="flex-1 border px-2 py-1 rounded"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          Add
        </button>
      </div>

      <table className="w-full border-collapse border text-left">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-2 py-1">Title</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Priority</th>
            <th className="border px-2 py-1">Due Date</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-100">
              <td className="border px-2 py-1">{task.title}</td>
              <td className="border px-2 py-1">
                <span className={`px-2 py-0.5 rounded ${
                  task.status === 'pending' ? 'bg-yellow-200' :
                  task.status === 'completed' ? 'bg-green-200' : 'bg-red-200'
                }`}>
                  {task.status}
                </span>
              </td>
              <td className="border px-2 py-1">{task.priority}</td>
              <td className="border px-2 py-1">{task.dueDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
