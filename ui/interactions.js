import { 
  addTask, 
  toggleTask, 
  deleteTask, 
  clearCompleted, 
  setFilter, 
  toggleTheme,
  sortTasks 
} from '../state.js';
import { showToast } from './render.js';

export function bindInteractions() {
  // FAB para adicionar tarefa
  document.getElementById('addBtn').addEventListener('click', () => {
    document.getElementById('addTaskModal').classList.remove('hidden');
    document.getElementById('taskInput').focus();
  });
  
  // Botão de cancelar no modal
  document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('addTaskModal').classList.add('hidden');
    document.getElementById('taskInput').value = '';
  });
  
  // Salvar tarefa
  document.getElementById('saveTaskBtn').addEventListener('click', () => {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (text) {
      addTask(text);
      showToast('Tarefa adicionada com sucesso!');
      input.value = '';
      document.getElementById('addTaskModal').classList.add('hidden');
    }
  });
  
  // Enter para salvar
  document.getElementById('taskInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('saveTaskBtn').click();
    }
  });
  
  // Alternar tema
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  
  // Alternar filtro
  document.getElementById('filterBtn').addEventListener('click', () => {
    const panel = document.getElementById('filterPanel');
    panel.classList.toggle('hidden');
    panel.setAttribute('aria-hidden', panel.classList.contains('hidden'));
  });
  
  // Botões de filtro
  document.querySelectorAll('.filter-option').forEach(btn => {
    btn.addEventListener('click', () => {
      setFilter(btn.dataset.filter);
      document.getElementById('filterPanel').classList.add('hidden');
    });
  });
  
  // Limpar concluídas
  document.getElementById('clearCompleted').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar todas as tarefas concluídas?')) {
      clearCompleted();
      showToast('Tarefas concluídas removidas');
    }
  });
  
  // Ordenar tarefas
  document.getElementById('sortBtn').addEventListener('click', () => {
    const criteria = prompt('Ordenar por:\n1. Data (mais recentes)\n2. Alfabético\n3. Status (concluídas por último)');
    
    switch(criteria) {
      case '1': sortTasks('date'); break;
      case '2': sortTasks('alphabetical'); break;
      case '3': sortTasks('completed'); break;
    }
  });
  
  // Controle por voz
  async function requestMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (err) {
    showToast('Permissão de microfone negada', 'error')
    return false
  }
}

  document.getElementById('voiceBtn').addEventListener('click', startVoiceRecognition);
  
  // Interações com a lista
  document.getElementById('taskList').addEventListener('click', e => {
    const toggleId = e.target.dataset.toggle;
    const deleteId = e.target.dataset.delete;

    if (toggleId) {
      toggleTask(Number(toggleId));
      showToast('Status da tarefa atualizado');
    }
    
    if (deleteId) {
      if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
        deleteTask(Number(deleteId));
        showToast('Tarefa excluída');
      }
    }
  });
  
  // Fechar modal ao clicar fora
  document.getElementById('addTaskModal').addEventListener('click', (e) => {
    if (e.target.id === 'addTaskModal') {
      document.getElementById('addTaskModal').classList.add('hidden');
    }
  });
}
async function startVoiceRecognition() {
  // Verifica suporte
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    showToast('Reconhecimento de voz não suportado', 'error')
    return
  }

  // Solicita permissão (PWA precisa disso)
  const permissionGranted = await requestMicrophonePermission()
  if (!permissionGranted) return

  const recognition = new SpeechRecognition()

  recognition.lang = 'pt-BR'
  recognition.interimResults = false
  recognition.maxAlternatives = 1
  recognition.continuous = false

  try {
    recognition.start()
    showToast('🎤 Ouvindo... fale sua tarefa')
  } catch (err) {
    showToast('Não foi possível iniciar o microfone', 'error')
  }

  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript
    if (transcript.trim()) {
      addTask(transcript)
      showToast('Tarefa adicionada por voz!')
    }
  }

  recognition.onerror = event => {
    console.error('Erro voz:', event.error)

    const errors = {
      'not-allowed': 'Permissão de microfone negada',
      'service-not-allowed': 'Serviço de voz bloqueado no PWA',
      'network': 'Erro de rede no reconhecimento de voz'
    }

    showToast(errors[event.error] || 'Erro no reconhecimento de voz', 'error')
  }
}
