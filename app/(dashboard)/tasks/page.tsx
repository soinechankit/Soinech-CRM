"use client";

import { useEffect, useState, useMemo } from "react";

type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  due_date: string;
  created_at: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks/list");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = filterPriority ? task.priority === filterPriority : true;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, filterPriority]);

  const calculateDaysLeft = (due: string) => {
    const diff = Math.ceil((new Date(due).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    if (diff < 0) return { text: "Overdue", color: "text-red-600 bg-red-50" };
    if (diff === 0) return { text: "Due Today", color: "text-amber-600 bg-amber-50" };
    return { text: `${diff} days left`, color: "text-emerald-600 bg-emerald-50" };
  };

  const getPriorityBadge = (priority: string) => {
    const styles: Record<string, string> = {
      high: "text-red-700 bg-red-100 border-red-200",
      medium: "text-amber-700 bg-amber-100 border-amber-200",
      low: "text-emerald-700 bg-emerald-100 border-emerald-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${styles[priority.toLowerCase()] || "bg-gray-100"}`}>
        {priority}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-4 md:p-10 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-950 tracking-tight">My Tasks</h1>
            <p className="text-slate-500 font-medium text-sm md:text-base">Monitoring {filteredTasks.length} Task</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full sm:w-64 md:w-80 pl-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none text-sm shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 outline-none shadow-sm cursor-pointer hover:border-indigo-300 transition-all"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
        <div className="hidden md:block bg-white rounded-[20px] shadow-xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Task Information</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Priority</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Deadline Status</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTasks.map((task) => {
                const deadline = calculateDaysLeft(task.due_date);
                return (
                  <tr key={task.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="px-8 py-5">
                      <div className="max-w-[300px]">
                        <p className="font-bold text-slate-700 truncate">{task.title}</p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5">{getPriorityBadge(task.priority)}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${deadline.color}`}>
                        {deadline.text}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedTask(task)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- MOBILE CARD VIEW (Visible on Small Screens) --- */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filteredTasks.map((task) => {
            const deadline = calculateDaysLeft(task.due_date);
            return (
              <div key={task.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-start mb-3">
                  <div className="max-w-[70%]">
                    <p className="font-bold text-slate-700 text-base">{task.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                  </div>
                  {getPriorityBadge(task.priority)}
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${deadline.color}`}>
                    {deadline.text}
                  </span>
                  <button 
                    onClick={() => setSelectedTask(task)}
                    className="text-indigo-600 text-xs font-bold hover:underline"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- TASK DETAIL MODAL --- */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-indigo-900/20 animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setSelectedTask(null)}></div>
          
          <div className="relative bg-white w-full max-w-2xl rounded-[24px] md:rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 md:px-8 pt-8 pb-4 flex justify-between items-start border-b border-slate-50">
              <div className="pr-4">
                <div className="flex flex-wrap gap-2 mb-2 items-center">
                  {getPriorityBadge(selectedTask.priority)}
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #{selectedTask.id.slice(0, 5)}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-indigo-950 leading-tight">
                  {selectedTask.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedTask(null)}
                className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-500 rounded-full transition-all text-slate-400 shrink-0"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
              <div className="space-y-6 md:y-8">
                <div>
                  <label className="text-[10px] md:text-[11px] uppercase font-black text-indigo-400 tracking-[0.2em] block mb-3">Task Brief</label>
                  <div className="bg-indigo-50/30 p-5 md:p-6 rounded-2xl border border-indigo-100/50">
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap italic font-medium">
                      "{selectedTask.description || "No specific details provided for this assignment."}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Date Logged</p>
                      <p className="text-sm font-black text-slate-700">{formatDate(selectedTask.created_at)}</p>
                    </div>
                  </div>



                  
                  
                  
          

                  <div className="p-4 md:p-5 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-400">Target Deadline</p>
                      <p className="text-sm font-black text-slate-700">{formatDate(selectedTask.due_date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end">
              <button 
                onClick={() => setSelectedTask(null)}
                className="w-full sm:w-auto px-8 py-3 bg-indigo-950 text-white rounded-xl font-bold text-sm hover:bg-indigo-900 transition-all shadow-xl shadow-indigo-100 active:scale-95"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}