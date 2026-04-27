const YEAR    = 2026;
const STORAGE = 'moodboard_' + YEAR;
const MONTHS  = ['Janv','Févr','Mars','Avr','Mai','Juin','Juil','Août','Sept','Oct','Nov','Déc'];

/* ── Données ──────────────────────────────────────────────── */
function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE)) || {}; }
  catch { return {}; }
}
function save(data) {
  localStorage.setItem(STORAGE, JSON.stringify(data));
}

/* ── Utilitaires date ─────────────────────────────────────── */
function daysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function isToday(month, day) {
  const t = new Date();
  return t.getFullYear() === YEAR && t.getMonth() === month && t.getDate() === day;
}

function dayKey(month, day) {
  return `${month + 1}-${day}`;
}

function formatDate(month, day) {
  return `${day} ${MONTHS[month]} ${YEAR}`;
}

/* ── Construction de la grille ────────────────────────────── */
function buildGrid() {
  const grid = document.getElementById('grid');
  const data = load();
  grid.innerHTML = '';

  for (let m = 0; m < 12; m++) {
    const row = document.createElement('div');
    row.className = 'month-row';

    const label = document.createElement('div');
    label.className = 'month-label';
    label.textContent = MONTHS[m];
    row.appendChild(label);

    const days = document.createElement('div');
    days.className = 'days-row';

    const total = daysInMonth(m, YEAR);
    for (let d = 1; d <= total; d++) {
      const key  = dayKey(m, d);
      const cell = document.createElement('div');
      cell.className = 'day';
      cell.dataset.month = m;
      cell.dataset.day   = d;
      cell.dataset.key   = key;
      cell.title = formatDate(m, d);

      // Numéro du jour
      const num = document.createElement('span');
      num.className = 'day-num';
      num.textContent = d;
      cell.appendChild(num);

      if (data[key]) cell.dataset.mood = data[key];
      if (isToday(m, d)) cell.classList.add('today');

      cell.addEventListener('click', onDayClick);
      days.appendChild(cell);
    }

    row.appendChild(days);
    grid.appendChild(row);
  }
}

/* ── Popup ────────────────────────────────────────────────── */
const popup    = document.getElementById('popup');
const popupLbl = document.getElementById('popupLabel');
let activeKey  = null;

function onDayClick(e) {
  const cell = e.currentTarget;
  activeKey  = cell.dataset.key;
  const m    = parseInt(cell.dataset.month);
  const d    = parseInt(cell.dataset.day);

  popupLbl.textContent = formatDate(m, d);

  const rect = cell.getBoundingClientRect();
  const pw   = 200;
  let left   = rect.left + window.scrollX;
  let top    = rect.bottom + window.scrollY + 8;

  if (left + pw > window.innerWidth - 8) left = window.innerWidth - pw - 8;
  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
  popup.classList.add('visible');
  e.stopPropagation();
}

document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    if (!activeKey) return;
    const mood = btn.dataset.mood;
    const data = load();

    if (mood === '') delete data[activeKey];
    else data[activeKey] = mood;
    save(data);

    const cell = document.querySelector(`.day[data-key="${activeKey}"]`);
    if (cell) {
      if (mood === '') delete cell.dataset.mood;
      else cell.dataset.mood = mood;
    }

    closePopup();
    e.stopPropagation();
  });
});

function closePopup() {
  popup.classList.remove('visible');
  activeKey = null;
}

document.addEventListener('click', closePopup);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });

/* ── Tutoriel ─────────────────────────────────────────────── */
const overlay   = document.getElementById('tutoOverlay');
const tutoBtn   = document.getElementById('tutoBtn');
const tutoClose = document.getElementById('tutoClose');

tutoBtn.addEventListener('click',   () => overlay.classList.add('visible'));
tutoClose.addEventListener('click', () => overlay.classList.remove('visible'));
overlay.addEventListener('click', e => {
  if (e.target === overlay) overlay.classList.remove('visible');
});

if (!localStorage.getItem('moodboard_tuto_seen')) {
  overlay.classList.add('visible');
  localStorage.setItem('moodboard_tuto_seen', '1');
}

/* ── Init ─────────────────────────────────────────────────── */
document.getElementById('yearLabel').textContent = YEAR;
buildGrid();
