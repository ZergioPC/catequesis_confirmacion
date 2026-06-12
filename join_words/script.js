let pairs = [];
let cards = [];
let selectedCard = null;
let matchedPairs = 0;
let isProcessing = false;
let timerInterval = null;
let seconds = 0;

const board = document.getElementById('game-board');
const pairsCount = document.getElementById('pairs-count');
const totalPairs = document.getElementById('total-pairs');
const timerDisplay = document.getElementById('timer-display');
const message = document.getElementById('message');
const resetBtn = document.getElementById('reset-btn');

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function createCards(pairsData) {
    const items = [];
    pairsData.forEach((pair, index) => {
        items.push({ id: index, text: pair.word, type: 'word' });
        items.push({ id: index, text: pair.meaning, type: 'meaning' });
    });
    return shuffle(items);
}

function renderBoard() {
    board.innerHTML = '';
    cards.forEach(card => {
        const el = document.createElement('div');
        el.className = `card ${card.type}`;
        if (card.matched) el.classList.add('matched');
        el.dataset.index = cards.indexOf(card);
        el.textContent = card.text;
        el.addEventListener('click', () => handleCardClick(cards.indexOf(card)));
        board.appendChild(el);
    });
    updateScore();
}

function handleCardClick(index) {
    if (isProcessing) return;
    const card = cards[index];
    if (card.matched) return;

    if (selectedCard === null) {
        selectedCard = index;
        highlightCard(index, true);
        message.textContent = '';
    } else if (selectedCard === index) {
        highlightCard(index, false);
        selectedCard = null;
    } else {
        const first = cards[selectedCard];
        if (first.type === card.type) {
            highlightCard(selectedCard, false);
            selectedCard = index;
            highlightCard(index, true);
            message.textContent = 'Selecciona una palabra del tipo opuesto';
            message.style.color = '#ff9800';
            return;
        }
        isProcessing = true;
        highlightCard(index, true);

        if (first.id === card.id) {
            setTimeout(() => {
                first.matched = true;
                card.matched = true;
                highlightCard(selectedCard, false);
                highlightCard(index, false);
                matchedPairs++;
                updateScore();
                selectedCard = null;
                isProcessing = false;
                renderBoard();
                if (matchedPairs === pairs.length) {
                    stopTimer();
                    message.textContent = `¡Felicidades! Completaste todas las parejas en ${formatTime(seconds)} 🎉`;
                    message.style.color = '#4caf50';
                } else {
                    message.textContent = '¡Correcto!';
                    message.style.color = '#4caf50';
                }
            }, 300);
        } else {
            message.textContent = 'Incorrecto, intenta de nuevo';
            message.style.color = '#f44336';
            const prev = selectedCard;
            setTimeout(() => {
                const prevEl = board.querySelector(`[data-index="${prev}"]`);
                const currEl = board.querySelector(`[data-index="${index}"]`);
                if (prevEl) prevEl.classList.add('wrong');
                if (currEl) currEl.classList.add('wrong');
                setTimeout(() => {
                    highlightCard(prev, false);
                    highlightCard(index, false);
                    if (prevEl) prevEl.classList.remove('wrong');
                    if (currEl) currEl.classList.remove('wrong');
                    selectedCard = null;
                    isProcessing = false;
                }, 400);
            }, 300);
        }
    }
}

function highlightCard(index, state) {
    const el = board.querySelector(`[data-index="${index}"]`);
    if (el) {
        if (state) el.classList.add('selected');
        else el.classList.remove('selected');
    }
}

function formatTime(s) {
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${m}:${sec}`;
}

function startTimer() {
    stopTimer();
    seconds = 0;
    timerDisplay.textContent = formatTime(0);
    timerInterval = setInterval(() => {
        seconds++;
        timerDisplay.textContent = formatTime(seconds);
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateScore() {
    pairsCount.textContent = matchedPairs;
    totalPairs.textContent = pairs.length;
}

async function init() {
    try {
        const res = await fetch('pairs.json');
        pairs = await res.json();
    } catch {
        pairs = [
            { word: 'Hola', meaning: 'Saludo informal' },
            { word: 'Adiós', meaning: 'Despedida' },
            { word: 'Casa', meaning: 'Lugar para vivir' },
        ];
    }
    resetGame();
}

function resetGame() {
    stopTimer();
    matchedPairs = 0;
    selectedCard = null;
    isProcessing = false;
    message.textContent = '';
    cards = createCards(pairs);
    renderBoard();
    startTimer();
}

resetBtn.addEventListener('click', resetGame);

init();
