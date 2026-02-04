"use client";

import { useState, useEffect } from "react";
import { Calendar, User as UserIcon, AlertCircle, FileText, Send, CheckCircle2 } from "lucide-react";

type User = { id: string; full_name: string; email: string };

export default function NewTaskPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const created_by = "bdcfe963-1495-4875-a07f-0e9d35b66251"; 

  useEffect(() => {
    fetch("/api/profiles/list")
      .then(res => res.json())
      .then(data => {
        if (data?.users) setUsers(data.users);
      })
      .catch(err => console.error("Error fetching users:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/tasks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          assigned_to: assignedTo || null,
          due_date: dueDate || null,
          priority,
          created_by,
        }),
      });

      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setStatus({ type: 'success', msg: `Task "${data.task.title}" created successfully!` });
      
      // Reset form
      setTitle("");
      setDescription("");
      setAssignedTo("");
      setDueDate("");
      setPriority("medium");
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-white">
          <h1 className="text-2xl font-semibold tracking-tight">Create New Task</h1>
          <p className="text-slate-400 text-sm mt-1">Fill in the details to assign a task to your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Status Messages */}
          {status && (
            <div className={`p-4 rounded-lg flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="text-sm font-medium">{status.msg}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <div className="relative">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Design System Update"
                className="w-full pl-3 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide context for the task..."
              rows={4}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                <select
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                >
                  <option value="">Select teammate</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.full_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'urgent'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-md border transition-all ${
                    priority === p 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' 
                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                <span>Create Task</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}