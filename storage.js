const KEY = 'acoes-rapidas-v2';
const BACKUP_KEY = 'acoes-rapidas-backup';

export function loadTasks() {
  try {
    const data = localStorage.getItem(KEY);
    if (!data) return [];
    
    const tasks = JSON.parse(data);
    
    // Migração de dados antigos
    if (tasks.length > 0 && !tasks[0].createdAt) {
      const migrated = tasks.map(task => ({
        ...task,
        createdAt: new Date().toISOString(),
        completedAt: null
      }));
      saveTasks(migrated);
      return migrated;
    }
    
    return tasks;
  } catch {
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    // Criar backup antes de salvar
    const current = localStorage.getItem(KEY);
    if (current) {
      localStorage.setItem(BACKUP_KEY, current);
    }
    
    localStorage.setItem(KEY, JSON.stringify(tasks));
    return true;
  } catch {
    console.error('Erro ao salvar tarefas');
    return false;
  }
}

export function restoreBackup() {
  try {
    const backup = localStorage.getItem(BACKUP_KEY);
    if (backup) {
      localStorage.setItem(KEY, backup);
      return JSON.parse(backup);
    }
    return null;
  } catch {
    return null;
  }
}

export function exportTasks() {
  const tasks = loadTasks();
  const dataStr = JSON.stringify(tasks, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'tarefas-backup.json';
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importTasks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const tasks = JSON.parse(e.target.result);
        saveTasks(tasks);
        resolve(tasks);
      } catch (error) {
        reject(new Error('Arquivo inválido'));
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}