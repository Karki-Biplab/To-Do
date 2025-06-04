'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Check, Trash2, Edit3, Calendar, Clock, Zap, Target } from 'lucide-react';

// Custom Hook for localStorage
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

const TodoItem = React.memo(({ todo, onToggle, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);

  const handleSave = useCallback(() => {
    if (editText.trim()) {
      onEdit(todo.id, editText.trim());
      setIsEditing(false);
    }
  }, [editText, onEdit, todo.id]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-300 transform hover:scale-[1.02] hover:bg-white/15 ${
        todo.completed ? 'opacity-75' : ''
      }`}
      aria-label={todo.completed ? 'Completed task' : 'Active task'}
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onToggle(todo.id)}
          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
            todo.completed
              ? 'bg-green-500 border-green-500'
              : 'border-white/40 hover:border-green-400'
          }`}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && <Check className="w-4 h-4 text-white" />}
        </button>

        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              onBlur={handleSave}
              className="bg-white/10 border border-white/30 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
              aria-label="Edit task"
            />
          ) : (
            <div>
              <p className={`text-lg ${todo.completed ? 'line-through text-white/60' : 'text-white'}`}>
                {todo.text}
              </p>
              <div className="flex items-center space-x-4 mt-2 text-white/50 text-sm">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Created: {formatDate(todo.createdAt)}</span>
                </div>
                {todo.completed && todo.completedAt && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Completed: {formatDate(todo.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditText(todo.text);
              }}
              className="p-2 text-white/60 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-all duration-300"
              aria-label="Edit task"
            >
              <Edit3 className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all duration-300"
            aria-label="Delete task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

TodoItem.displayName = 'TodoItem';

const StatsDashboard = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center space-x-3">
        <Target className="text-purple-400 w-8 h-8" />
        <div>
          <p className="text-white/60 text-sm">Total Tasks</p>
          <p className="text-white text-2xl font-bold">{stats.total}</p>
        </div>
      </div>
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center space-x-3">
        <Zap className="text-yellow-400 w-8 h-8" />
        <div>
          <p className="text-white/60 text-sm">Active</p>
          <p className="text-white text-2xl font-bold">{stats.active}</p>
        </div>
      </div>
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center space-x-3">
        <Check className="text-green-400 w-8 h-8" />
        <div>
          <p className="text-white/60 text-sm">Completed</p>
          <p className="text-white text-2xl font-bold">{stats.completed}</p>
        </div>
      </div>
    </div>
  </div>
);

const TodoApp = () => {
  const [todos, setTodos] = useLocalStorage('badass-todos', []);
  const [newTodo, setNewTodo] = useState('');
  const [filter, setFilter] = useState('all');

  const addTodo = useCallback(() => {
    if (newTodo.trim()) {
      const todo = {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null,
      };
      setTodos([todo, ...todos]);
      setNewTodo('');
    }
  }, [newTodo, todos, setTodos]);

  const toggleTodo = useCallback(
    (id) => {
      setTodos(
        todos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                completed: !todo.completed,
                completedAt: !todo.completed ? new Date().toISOString() : null,
              }
            : todo
        )
      );
    },
    [todos, setTodos]
  );

  const deleteTodo = useCallback(
    (id) => {
      setTodos(todos.filter((todo) => todo.id !== id));
    },
    [todos, setTodos]
  );

  const editTodo = useCallback(
    (id, newText) => {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, text: newText } : todo
        )
      );
    },
    [todos, setTodos]
  );

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed);
      case 'completed':
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const stats = useMemo(
    () => ({
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      active: todos.filter((t) => !t.completed).length,
    }),
    [todos]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-pulse">
            ⚡ BADASS TODO ⚡
          </h1>
          <p className="text-white/80 text-xl">Crush your tasks like a boss</p>
        </header>

        <StatsDashboard stats={stats} />

        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/20">
          <div className="flex space-x-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be conquered today?"
              className="flex-1 bg-white/10 border border-white/30 rounded-xl px-6 py-4 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
              aria-label="Add new task"
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              aria-label="Add task"
            >
              <Plus className="w-5 h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </section>

        <div className="flex space-x-4 mb-6">
          {['all', 'active', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                filter === filterType
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              aria-label={`Show ${filterType} tasks`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </button>
          ))}
        </div>

        <section aria-live="polite">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-white/60 text-xl">
                {filter === 'all'
                  ? 'No tasks yet. Time to add some!'
                  : `No ${filter} tasks found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={toggleTodo}
                  onDelete={deleteTodo}
                  onEdit={editTodo}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="text-center mt-12 text-white/40">
          <p>Built with 🔥 and pure frontend magic</p>
          <p className="text-sm mt-2">Show your friend what real development looks like! 💪</p>
        </footer>
      </div>
    </div>
  );
};

export default TodoApp;