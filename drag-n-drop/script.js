let currentLevel = 0;
let score = 0;
let timer = 0;
let timerInterval = null;
let levels = [];
let currentWords = [];
let isCompleted = false;

const dropZone = document.getElementById('dropZone');
const wordPool = document.getElementById('wordPool');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const checkBtn = document.getElementById('checkBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modalTitle');
const modalMsg = document.getElementById('modalMsg');
const modalBtn = document.getElementById('modalBtn');

function init() {
  levels = shuffle([
    {
      "id": 1,
      "words": ["Bautismo", "Confesión", "Comunión", "Confirmación"]
    },
    {
      "id": 2,
      "words": [
        "Amarás a Dios sobre todas las cosas",
        "No tomarás el nombre de Dios en vano",
        "Santificarás las fiestas",
        "Honrarás a tu padre y a tu madre",
        "No matarás",
        "No cometerás actos impuros",
        "No robarás",
        "No darás falso testimonio ni mentirás",
        "No consentirás pensamientos ni deseos impuros",
        "No codiciarás los bienes ajenos"
      ]
    },
    {
      "id": 3,
      "words": ["Jesús", "te llama a ser", "sacerdote", "profeta", "rey"]
    }
  ]);
  loadLevel(0);
  startTimer();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadLevel(index) {
  if (index >= levels.length) {
    showModal('¡Felicidades!', `Completaste todos los niveles. Puntuación final: ${score}`);
    return;
  }
  isCompleted = false;
  currentLevel = index;
  currentWords = [...levels[index].words];
  const shuffled = shuffle([...currentWords]);
  dropZone.innerHTML = '';
  wordPool.innerHTML = '';
  nextBtn.disabled = true;

  shuffled.forEach(w => {
    const el = createWordElement(w);
    wordPool.appendChild(el);
  });

  clearFeedback();
}

function createWordElement(text) {
  const el = document.createElement('span');
  el.className = 'word';
  el.textContent = text;
  el.draggable = true;

  el.addEventListener('dragstart', onDragStart);
  el.addEventListener('dragend', onDragEnd);

  return el;
}

let dragSrc = null;

function onDragStart(e) {
  dragSrc = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.textContent);
}

function onDragEnd(e) {
  this.classList.remove('dragging');
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function onContainerDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('drag-over');
}

function onContainerDragEnter(e) {
  e.preventDefault();
  this.classList.add('drag-over');
}

function onContainerDragLeave(e) {
  this.classList.remove('drag-over');
}

function onContainerDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (!dragSrc) return;

  const targetWord = e.target.closest('.word');
  const srcParent = dragSrc.parentNode;
  const isSameContainer = srcParent === this;

  if (targetWord && isSameContainer) {
    const siblings = [...this.children];
    const srcIdx = siblings.indexOf(dragSrc);
    const tgtIdx = siblings.indexOf(targetWord);
    if (srcIdx < tgtIdx) {
      this.insertBefore(dragSrc, targetWord.nextSibling);
    } else {
      this.insertBefore(dragSrc, targetWord);
    }
  } else if (targetWord) {
    this.insertBefore(dragSrc, targetWord);
  } else {
    this.appendChild(dragSrc);
  }

  clearFeedback();
  nextBtn.disabled = true;
  dragSrc = null;
}

function clearFeedback() {
  document.querySelectorAll('.word').forEach(el => {
    el.classList.remove('correct', 'incorrect');
  });
}

checkBtn.addEventListener('click', () => {
  if (isCompleted) return;
  const arranged = [...dropZone.children].map(el => el.textContent);
  if (arranged.length !== currentWords.length) {
    showModal('Faltan palabras', 'Arrastra todas las palabras al área de destino.');
    return;
  }

  let allCorrect = true;
  const dropWords = [...dropZone.children];
  dropWords.forEach((el, i) => {
    if (el.textContent === currentWords[i]) {
      el.classList.add('correct');
    } else {
      el.classList.add('incorrect');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    isCompleted = true;
    score += Math.max(10 - Math.floor(timer / 10), 1);
    scoreEl.textContent = score;
    nextBtn.disabled = false;
    showModal('¡Correcto!', 'Has ordenado la frase correctamente.');
  } else {
    showModal('Intenta de nuevo', 'Algunas palabras están en la posición incorrecta.');
  }
});

nextBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  loadLevel(currentLevel + 1);
});

resetBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  score = 0;
  timer = 0;
  scoreEl.textContent = score;
  timerEl.textContent = timer;
  loadLevel(0);
});

modalBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  if (isCompleted) {
    nextBtn.click();
  }
});

function showModal(title, msg) {
  modalTitle.textContent = title;
  modalMsg.textContent = msg;
  overlay.classList.remove('hidden');
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timer = 0;
  timerEl.textContent = timer;
  timerInterval = setInterval(() => {
    timer++;
    timerEl.textContent = timer;
  }, 1000);
}

[dropZone, wordPool].forEach(container => {
  container.addEventListener('dragover', onContainerDragOver);
  container.addEventListener('dragenter', onContainerDragEnter);
  container.addEventListener('dragleave', onContainerDragLeave);
  container.addEventListener('drop', onContainerDrop);
});

init();
