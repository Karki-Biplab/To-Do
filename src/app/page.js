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
      className={`bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20 transition-all duration-300 hover:scale-[1.01] md:hover:scale-[1.02] hover:bg-white/15 ${
        todo.completed ? 'opacity-75' : ''
      }`}
      aria-label={todo.completed ? 'Completed task' : 'Active task'}
    >
      <div className="flex items-start space-x-3 md:space-x-4">
        <button
          onClick={() => onToggle(todo.id)}
          className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 mt-1 ${
            todo.completed
              ? 'bg-green-500 border-green-500'
              : 'border-white/40 hover:border-green-400'
          }`}
          aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {todo.completed && <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
              onBlur={handleSave}
              className="bg-white/10 border border-white/30 rounded-lg px-3 py-1 md:px-4 md:py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
              autoFocus
              aria-label="Edit task"
            />
          ) : (
            <div>
              <p className={`text-base md:text-lg truncate ${todo.completed ? 'line-through text-white/60' : 'text-white'}`}>
                {todo.text}
              </p>
              <div className="flex flex-col md:flex-row md:items-center space-y-1 md:space-y-0 md:space-x-4 mt-1 md:mt-2 text-white/50 text-xs md:text-sm">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Created: {formatDate(todo.createdAt)}</span>
                </div>
                {todo.completed && todo.completedAt && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                    <span>Completed: {formatDate(todo.completedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-1 md:space-x-2">
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditText(todo.text);
              }}
              className="p-1 md:p-2 text-white/60 hover:text-blue-400 hover:bg-white/10 rounded-lg transition-all duration-300"
              aria-label="Edit task"
            >
              <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 md:p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all duration-300"
            aria-label="Delete task"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
});

TodoItem.displayName = 'TodoItem';

const StatsDashboard = ({ stats }) => (
  <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
    <div className="bg-white/10 backdrop-blur-md rounded-lg md:rounded-2xl p-3 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center space-x-2 md:space-x-3">
        <Target className="text-purple-400 w-5 h-5 md:w-8 md:h-8" />
        <div>
          <p className="text-white/60 text-xs md:text-sm">Total Tasks</p>
          <p className="text-white text-lg md:text-2xl font-bold">{stats.total}</p>
        </div>
      </div>
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-lg md:rounded-2xl p-3 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center space-x-2 md:space-x-3">
        <Zap className="text-yellow-400 w-5 h-5 md:w-8 md:h-8" />
        <div>
          <p className="text-white/60 text-xs md:text-sm">Active</p>
          <p className="text-white text-lg md:text-2xl font-bold">{stats.active}</p>
        </div>
      </div>
    </div>
    <div className="bg-white/10 backdrop-blur-md rounded-lg md:rounded-2xl p-3 md:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex items-center space-x-2 md:space-x-3">
        <Check className="text-green-400 w-5 h-5 md:w-8 md:h-8" />
        <div>
          <p className="text-white/60 text-xs md:text-sm">Completed</p>
          <p className="text-white text-lg md:text-2xl font-bold">{stats.completed}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-3 sm:p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 sm:w-80 sm:h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 sm:w-80 sm:h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-20 left-20 w-40 h-40 sm:w-80 sm:h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 sm:mb-4 animate-pulse">
            ⚡ BADASS TODO ⚡
          </h1>
          <p className="text-white/80 text-sm sm:text-xl">Crush your tasks like a boss</p>
        </header>

        {/* Stats Dashboard */}
        <StatsDashboard stats={stats} />

        {/* Add Todo Section */}
        <section className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 mb-6 md:mb-8 border border-white/20">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs to be conquered today?"
              className="flex-1 bg-white/10 border border-white/30 rounded-lg sm:rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
              aria-label="Add new task"
            />
            <button
              onClick={addTodo}
              disabled={!newTodo.trim()}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 sm:px-6 sm:py-3 md:px-8 md:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
              aria-label="Add task"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Add Task</span>
            </button>
          </div>
        </section>

        {/* Filter Buttons */}
        <div className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6">
          {['all', 'active', 'completed'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-2 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 text-xs sm:text-sm ${
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

        {/* Todo List */}
        <section aria-live="polite" className="mb-12">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎯</div>
              <p className="text-white/60 text-sm sm:text-xl">
                {filter === 'all'
                  ? 'No tasks yet. Time to add some!'
                  : `No ${filter} tasks found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
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

        {/* Footer */}
        <footer className="text-center mt-8 sm:mt-12 text-white/40 text-xs sm:text-sm">
          <p>Built with 🔥 and pure frontend magic</p>
          <p className="mt-1 sm:mt-2">Show your friend what real development looks like! 💪</p>
        </footer>
      </div>
    </div>
  );
};

export default TodoApp;