import React, { useState } from 'react';
import { Clock, Plus, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useWedding } from '@/app/context/WeddingContext';
import { formatDate } from '@/lib/utils';
import { TaskPriority } from '@/types';

export const TasksEventsPage: React.FC = () => {
  const { tasks, events, toggleTaskStatus, addTask } = useWedding();
  const [activeTab, setActiveTab] = useState<'tasks' | 'events'>('tasks');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskDate, setNewTaskDate] = useState('2026-11-20');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      title: newTaskTitle,
      assigneeName: newTaskAssignee || 'Unassigned',
      creatorId: 'usr_current',
      dueDate: newTaskDate,
      priority: newTaskPriority,
      status: 'to_do',
    });

    setNewTaskTitle('');
    setNewTaskAssignee('');
  };

  const priorityColors = {
    urgent: 'danger' as const,
    high: 'wine' as const,
    medium: 'gold' as const,
    low: 'neutral' as const,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-wine-900">Tasks & Events</h2>
          <p className="text-xs text-charcoal-500 mt-1">
            Coordinate wedding preparations, delegate responsibilities across families, and schedule ceremonial events.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-sand-100 rounded-xl border border-sand-border self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'tasks' ? 'bg-white text-wine-900 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'events' ? 'bg-white text-wine-900 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Events Timeline ({events.length})
          </button>
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Task Quick Form */}
          <Card className="lg:col-span-1 h-fit">
            <CardHeader>
              <CardTitle className="text-base">Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Confirm wedding DJ & sound setup"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                    Assignee (Family Member)
                  </label>
                  <input
                    type="text"
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    placeholder="e.g. Vikram Verma (Groom side)"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-sand-border focus:ring-2 focus:ring-wine-800 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                      className="w-full px-2.5 py-2 text-xs rounded-xl border border-sand-border bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 uppercase mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newTaskDate}
                      onChange={(e) => setNewTaskDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-sand-border bg-white"
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="sm" className="w-full mt-2">
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Wedding Task Coordination</CardTitle>
              <span className="text-xs text-charcoal-500">
                Click any task checkbox to toggle completion
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className="p-4 rounded-xl border border-sand-border bg-white hover:border-gold-300 transition-all cursor-pointer flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => {}}
                      className="mt-1 w-4 h-4 rounded text-wine-800 focus:ring-wine-800 border-sand-300"
                    />
                    <div>
                      <p
                        className={`text-sm font-semibold ${
                          task.status === 'completed' ? 'line-through text-charcoal-400' : 'text-charcoal-900'
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-charcoal-500">
                        <span>Assigned: <strong className="text-wine-900">{task.assigneeName || 'Open'}</strong></span>
                        <span>•</span>
                        <span>Due: {task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={priorityColors[task.priority]}>{task.priority}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Events Timeline */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt, idx) => (
            <Card key={evt.id} className="relative overflow-hidden group hover:border-gold-400 transition-all">
              <div className="h-2 bg-gradient-to-r from-wine-800 to-gold-400" />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-wine-50 text-wine-800 border border-wine-100">
                    Day {idx + 1} • {evt.eventType.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-semibold text-gold-700">
                    {formatDate(evt.startTime, 'short')}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900">{evt.name}</h3>
                <p className="text-xs text-charcoal-600 leading-relaxed">{evt.description}</p>
                <div className="pt-2 border-t border-sand-border space-y-1 text-xs text-charcoal-500">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-wine-800 shrink-0" />
                    <span className="truncate">{evt.venueName}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-gold-600 shrink-0" />
                    <span>6:00 PM Onwards</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
