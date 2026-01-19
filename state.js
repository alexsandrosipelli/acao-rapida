import { loadTasks, saveTasks } from './storage.js';

let state = {
  tasks: [],
  filter: 'all',
  sortBy: 'created',
  theme: localStorage.getItem('theme') || 'light'
};

const subscribers = [];

export function initState() {
  state.tasks = loadTasks();
  document.documentElement.setAttribute('data-theme', state.theme);
}

export function getState() {
  return structuredClone(state);
}

export function subscribe(fn) {
  subscribers.push(fn);
}

function notify() {
  subscribers.forEach(fn => fn(getState()));
}

export function addTask(text) {
  if (!text || !text.trim()) return;
  
  state.tasks.push({
    id: Date.now(),
    text: text.trim(),
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: null
  });
  saveTasks(state.tasks);
  notify();
}

export function toggleTask(id) {
  state.tasks = state.tasks.map(t => {
    if (t.id === id) {
      const updated = { 
        ...t, 
        done: !t.done,
        completedAt: !t.done ? new Date().toISOString() : null
      };
      return updated;
    }
    return t;
  });
  saveTasks(state.tasks);
  notify();
}

export function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveTasks(state.tasks);
  notify();
}

export function clearCompleted() {
  state.tasks = state.tasks.filter(t => !t.done);
  saveTasks(state.tasks);
  notify();
}

export function setFilter(filter) {
  state.filter = filter;
  notify();
}

export function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('theme', state.theme);
  notify();
}

export function sortTasks(criteria) {
  state.sortBy = criteria;
  const sorted = [...state.tasks];
  
  switch(criteria) {
    case 'completed':
      sorted.sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
      break;
    case 'date':
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'alphabetical':
      sorted.sort((a, b) => a.text.localeCompare(b.text));
      break;
    default:
      sorted.sort((a, b) => b.id - a.id); // Mais recentes primeiro
  }
  
  state.tasks = sorted;
  saveTasks(state.tasks);
  notify();
}

export function getFilteredTasks() {
  const filtered = state.tasks.filter(task => {
    if (state.filter === 'pending') return !task.done;
    if (state.filter === 'completed') return task.done;
    return true;
  });
  
  return filtered;
}

export function getStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter(t => t.done).length;
  const pending = total - completed;
  
  return { total, completed, pending };
}