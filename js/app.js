// ===== Elements =====
const bottle       = document.getElementById('bottle');
const spinBtn      = document.getElementById('spinBtn');
const board        = document.querySelector('.board');
const truthDeck    = document.querySelector('.deck--truth');
const dareDeck     = document.querySelector('.deck--dare');
const overlay      = document.getElementById('modalOverlay');
const modalResult  = document.getElementById('modalResult');
const modalClose   = document.getElementById('modalClose');
const modalAgain   = document.getElementById('modalAgain');

// ===== State =====
let currentRotation = 0;   // accumulates so each spin keeps turning forward
let isSpinning = false;

// Bottle's SVG points UP at 0deg. The truth deck is on the LEFT (pointing
// up-left ≈ 270deg / -90deg) and the dare deck is on the RIGHT (90deg).
function sideForHeading(heading) {
  return heading > 180 ? 'dare' : 'truth'
}

function spin() {
  if (isSpinning) return;
  isSpinning = true;
  spinBtn.disabled = true;
  clearChosen();

  // Add several full turns (5–7) for a satisfying spin, then settle on the
  // target angle. We compute the next absolute rotation that (a) is greater
  // than the current one and (b) ends on the target heading.
  const extraTurns = 5 + Math.floor(Math.random() * 3);  // 5, 6, or 7
  let targetHeading = Math.random() * 360;

  // Keep the bottle clear of the dead-flat boundary (0/180) by a small margin
  // so the chosen side is never visually ambiguous.
  const MARGIN = 8;
  const distToAxis = Math.min(
    Math.abs(targetHeading - 0),
    Math.abs(targetHeading - 180),
    Math.abs(targetHeading - 360)
  );
  if (distToAxis < MARGIN) {
    targetHeading += MARGIN;            // push it off the axis
    targetHeading %= 360;
  }

  // Normalize current rotation to find how far into the current circle we are.
  const currentHeading = ((currentRotation % 360) + 360) % 360;
  let delta = targetHeading - currentHeading;
  if (delta < 0) delta += 360;

  currentRotation += extraTurns * 360 + delta;
  bottle.style.transform = `rotate(${currentRotation}deg)`;

  // When the CSS transition finishes, reveal the result.
  const result = sideForHeading(targetHeading);
  bottle.addEventListener('transitionend', () => onSpinEnd(result), { once: true });
}

function onSpinEnd(result) {
  highlightDeck(result);
  showModal(result);
  isSpinning = false;
}

function highlightDeck(result) {
  (result === 'truth' ? truthDeck : dareDeck).classList.add('is-chosen');
}

function clearChosen() {
  truthDeck.classList.remove('is-chosen');
  dareDeck.classList.remove('is-chosen');
}

// ===== Modal =====
function showModal(result) {
  const label = result === 'truth' ? 'Partage' : 'Action';
  modalResult.textContent = label;
  modalResult.classList.remove('is-truth', 'is-dare');
  modalResult.classList.add(result === 'truth' ? 'is-truth' : 'is-dare');
  overlay.classList.add('is-open');
  overlay.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  overlay.classList.remove('is-open');
  overlay.setAttribute('aria-hidden', 'true');
  clearChosen();
  spinBtn.disabled = false;   // user must click Spin again manually
}

// ===== Events =====
spinBtn.addEventListener('click', spin);
modalClose.addEventListener('click', closeModal);
modalAgain.addEventListener('click', closeModal);

// Close when clicking the dimmed backdrop (but not the modal itself).
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) closeModal();
});

// Close on Escape.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
});