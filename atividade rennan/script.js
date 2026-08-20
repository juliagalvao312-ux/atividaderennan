const form = document.getElementById('loginForm');
const voiceUnlockButton = document.getElementById('voiceUnlock');
const statusElement = document.getElementById('status');
const lockStateElement = document.getElementById('lockState');
const hintElement = document.getElementById('voiceHint');

const COMMAND = 'desbloquear';
const REVERSE_HINT = 'raquelobsed';

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

function setStatus(message, type = 'normal') {
  statusElement.textContent = message;
  statusElement.classList.remove('locked', 'unlocked');

  if (type === 'locked') statusElement.classList.add('locked');
  if (type === 'unlocked') statusElement.classList.add('unlocked');
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    setStatus('Preencha usuário e senha para continuar.', 'locked');
    return;
  }

  setStatus('Tentativa registrada. O sistema ainda está em estado de dúvida.', 'locked');
});

voiceUnlockButton.addEventListener('click', () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    setStatus('Reconhecimento de voz não suportado neste navegador.', 'locked');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  setStatus('Escutando... diga o comando ao contrário.', 'locked');
  hintElement.textContent = `Comando esperado: ${REVERSE_HINT}`;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    const normalized = normalize(transcript);
    const reversed = normalized.split('').reverse().join('');

    if (reversed === COMMAND) {
      lockStateElement.textContent = 'DESBLOQUEADO';
      lockStateElement.style.color = '#79ffb3';
      lockStateElement.style.borderColor = 'rgba(121, 255, 179, 0.7)';
      lockStateElement.style.background = 'rgba(121, 255, 179, 0.08)';
      setStatus('Comando validado. Porta liberada.', 'unlocked');
      hintElement.textContent = 'Acesso autorizado. O labirinto se abriu.';
      return;
    }

    setStatus(`Comando recebido: "${transcript}". Inversão incorreta.`, 'locked');
    hintElement.textContent = `Dica: a frase ao contrário deve virar "${COMMAND}".`;
  };

  recognition.onerror = () => {
    setStatus('Não consegui captar o comando de voz.', 'locked');
    hintElement.textContent = `Tente novamente e diga: ${REVERSE_HINT}`;
  };

  recognition.onend = () => {
    recognition.stop();
  };
});
