import { getState, subscribe, getFilteredTasks, getStats } from '../state.js';

const list = document.getElementById('taskList');
const empty = document.getElementById('emptyState');
const taskStats = document.getElementById('taskStats');
const filterPanel = document.getElementById('filterPanel');

export function render() {
  update(getState());
  subscribe(update);
}

function update(state) {
  list.innerHTML = '';
  
  const filteredTasks = getFilteredTasks();
  const stats = getStats();
  
  // Atualizar estatísticas
  taskStats.textContent = `${stats.pending} pendente${stats.pending !== 1 ? 's' : ''}, ${stats.completed} concluída${stats.completed !== 1 ? 's' : ''}`;
  
  // Atualizar filtro ativo
  document.querySelectorAll('.filter-option').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === state.filter);
  });
  
  if (filteredTasks.length === 0) {
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';
    li.setAttribute('role', 'listitem');
    li.setAttribute('aria-label', `Tarefa: ${task.text}. ${task.done ? 'Concluída' : 'Pendente'}`);
    
    const date = new Date(task.createdAt).toLocaleDateString('pt-BR');
    
    li.innerHTML = `
      <div class="task-content">
        <span>${task.text}</span>
        <small class="task-date">Criada em ${date}</small>
      </div>
      <div class="task-actions">
        <button data-toggle="${task.id}" aria-label="${task.done ? 'Marcar como pendente' : 'Marcar como concluída'}">
          ${task.done ? '↶' : '✔'}
        </button>
        <button data-delete="${task.id}" aria-label="Excluir tarefa">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });
}

export function showToast(message, type = 'success') {
  const container = document.querySelector('.toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>
  `;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}