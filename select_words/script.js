let wordsData = null;
let dragItem = null;

const sourceContainer = document.getElementById('source-container');
const targetContainer = document.getElementById('target-container');
const titleEl = document.getElementById('title');
const instructionEl = document.getElementById('instruction');
const feedbackEl = document.getElementById('feedback');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');

async function loadWords() {
  // -----------------------------------
  // -----------------------------------
  const res = await fetch('words.json');
  // -----------------------------------
  // ----------------------------------- 
  wordsData = await res.json();
  titleEl.textContent = wordsData.title;
  instructionEl.textContent = wordsData.instruction;
  render();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function render() {
  sourceContainer.innerHTML = '';
  targetContainer.innerHTML = '';
  feedbackEl.textContent = '';
  feedbackEl.className = '';

  const shuffled = shuffle([...wordsData.words]);
  shuffled.forEach(w => {
    const el = createWordElement(w);
    sourceContainer.appendChild(el);
  });
}

function createWordElement(word) {
  const el = document.createElement('span');
  el.className = 'word';
  el.textContent = word.text;
  el.dataset.correct = word.correct;
  el.draggable = true;

  el.addEventListener('dragstart', onDragStart);
  el.addEventListener('dragend', onDragEnd);

  el.addEventListener('touchstart', onTouchStart, { passive: true });
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  el.addEventListener('touchend', onTouchEnd, { passive: true });

  return el;
}

function onDragStart(e) {
  dragItem = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
}

function onDragEnd(e) {
  e.target.classList.remove('dragging');
  dragItem = null;
}

sourceContainer.addEventListener('dragover', e => e.preventDefault());
targetContainer.addEventListener('dragover', e => {
  e.preventDefault();
  targetContainer.classList.add('drag-over');
});
targetContainer.addEventListener('dragleave', () => {
  targetContainer.classList.remove('drag-over');
});
targetContainer.addEventListener('drop', onDropTarget);

sourceContainer.addEventListener('drop', onDropSource);

function onDropTarget(e) {
  e.preventDefault();
  targetContainer.classList.remove('drag-over');
  if (!dragItem || dragItem.closest('.word-container') === targetContainer) return;
  moveWord(dragItem, targetContainer);
}

function onDropSource(e) {
  e.preventDefault();
  if (!dragItem || dragItem.closest('.word-container') === sourceContainer) return;
  moveWord(dragItem, sourceContainer);
}

function moveWord(el, target) {
  el.classList.remove('correct', 'incorrect', 'placed-correct', 'placed-incorrect');
  target.appendChild(el);
  feedbackEl.textContent = '';
  feedbackEl.className = '';
}

function onTouchStart(e) {
  dragItem = e.target.closest('.word');
  if (!dragItem) return;
  const touch = e.touches[0];
  dragItem._touchOffsetX = touch.clientX - dragItem.getBoundingClientRect().left;
  dragItem._touchOffsetY = touch.clientY - dragItem.getBoundingClientRect().top;
  dragItem.style.position = 'fixed';
  dragItem.style.zIndex = 1000;
  dragItem.style.pointerEvents = 'none';
  dragItem.style.width = dragItem.offsetWidth + 'px';
  updateTouchPosition(touch);
  dragItem.classList.add('dragging');
}

function onTouchMove(e) {
  if (!dragItem) return;
  e.preventDefault();
  const touch = e.touches[0];
  updateTouchPosition(touch);
}

function onTouchEnd(e) {
  if (!dragItem) return;
  dragItem.style.position = '';
  dragItem.style.zIndex = '';
  dragItem.style.pointerEvents = '';
  dragItem.style.width = '';
  dragItem.style.left = '';
  dragItem.style.top = '';
  dragItem.classList.remove('dragging');

  const touch = e.changedTouches[0];
  const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

  let container = dropTarget?.closest('.word-container');
  if (!container) {
    const word = dropTarget?.closest('.word');
    if (word) container = word.closest('.word-container');
  }

  if (container) {
    const current = dragItem.closest('.word-container');
    if (current !== container) {
      moveWord(dragItem, container);
    }
  }
  dragItem = null;
}

function updateTouchPosition(touch) {
  dragItem.style.left = (touch.clientX - dragItem._touchOffsetX) + 'px';
  dragItem.style.top = (touch.clientY - dragItem._touchOffsetY) + 'px';
}

checkBtn.addEventListener('click', () => {
  const items = targetContainer.querySelectorAll('.word');
  let allCorrect = true;

  items.forEach(el => {
    const isCorrect = el.dataset.correct === 'true';
    if (isCorrect) {
      el.className = 'word placed-correct';
    } else {
      el.className = 'word placed-incorrect';
      allCorrect = false;
    }
  });

  const sourceItems = sourceContainer.querySelectorAll('.word');
  sourceItems.forEach(el => {
    const isCorrect = el.dataset.correct === 'true';
    el.className = 'word';
    if (isCorrect) {
      el.classList.add('incorrect');
      allCorrect = false;
    }
  });

  if (allCorrect) {
    feedbackEl.textContent = '✓ ¡Correcto! Has seleccionado todas las palabras correctas.';
    feedbackEl.className = 'success';
  } else {
    feedbackEl.textContent = '✗ Hay palabras incorrectas en tu selección. Intenta de nuevo.';
    feedbackEl.className = 'error';
  }
});

resetBtn.addEventListener('click', render);

loadWords();
