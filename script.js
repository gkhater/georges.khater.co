const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('.decode-object').forEach((object) => {
  const grid = object.querySelector('.decode-grid');
  if (!grid) return;
  for (let index = 0; index < 64; index += 1) {
    const cell = document.createElement('i');
    cell.style.setProperty('--delay', `${(index % 8) * 28}ms`);
    grid.appendChild(cell);
  }
  object.addEventListener('pointerenter', () => object.classList.add('decoded'));
  object.addEventListener('pointerleave', () => object.classList.remove('decoded'));
});

const boardCanvas = document.querySelector('#dragon-board');
const moveLabel = document.querySelector('#dragon-move');

if (boardCanvas instanceof HTMLCanvasElement) {
  const context = boardCanvas.getContext('2d');
  const size = boardCanvas.width / 8;
  const pixels = {
    p: ['01110', '11111', '11111', '01110', '01110', '01110', '11111'],
    r: ['11111', '10101', '11111', '01110', '01110', '01110', '11111'],
    n: ['11000', '11110', '10111', '11111', '01110', '01110', '11111'],
    b: ['00100', '01110', '00100', '01110', '01110', '01110', '11111'],
    q: ['10101', '11111', '01110', '11111', '01110', '01110', '11111'],
    k: ['01010', '11111', '01010', '01110', '01110', '01110', '11111'],
  };
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const pieces = new Map();
  const put = (square, color, type) => pieces.set(square, { color, type });
  const resetBoard = () => {
    pieces.clear();
    ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach((file) => { put(`${file}2`, 'w', 'p'); put(`${file}7`, 'b', 'p'); });
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'].forEach((type, index) => { put(`${files[index]}1`, 'w', type); put(`${files[index]}8`, 'b', type); });
  };
  const moves = [
    ['e2', 'e4', '1. e4'], ['c7', 'c5', '1... c5'], ['g1', 'f3', '2. Nf3'], ['d7', 'd6', '2... d6'],
    ['d2', 'd4', '3. d4'], ['c5', 'd4', '3... cxd4'], ['f3', 'd4', '4. Nxd4'], ['g8', 'f6', '4... Nf6'],
    ['b1', 'c3', '5. Nc3'], ['g7', 'g6', '5... g6'], ['c1', 'e3', '6. Be3'], ['f8', 'g7', '6... Bg7'],
    ['f2', 'f3', '7. f3'], ['e8', 'g8', '7... O-O', ['h8', 'f8']], ['d1', 'd2', '8. Qd2'], ['b8', 'c6', '8... Nc6'],
    ['e1', 'c1', '9. O-O-O', ['a1', 'd1']], ['c8', 'd7', '9... Bd7'],
  ];
  const drawPiece = (square, piece) => {
    const file = files.indexOf(square[0]);
    const rank = Number(square[1]);
    const x = file * size;
    const y = (8 - rank) * size;
    const bitmap = pixels[piece.type];
    const pixelSize = 4;
    const startX = x + (size - bitmap[0].length * pixelSize) / 2;
    const startY = y + (size - bitmap.length * pixelSize) / 2;
    context.fillStyle = piece.color === 'w' ? '#f1efe9' : '#2b2851';
    bitmap.forEach((row, rowIndex) => [...row].forEach((value, columnIndex) => {
      if (value === '1') context.fillRect(startX + columnIndex * pixelSize, startY + rowIndex * pixelSize, pixelSize, pixelSize);
    }));
  };
  const draw = () => {
    context.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
    for (let rank = 0; rank < 8; rank += 1) for (let file = 0; file < 8; file += 1) {
      context.fillStyle = (file + rank) % 2 ? '#7770a7' : '#e0dcf2';
      context.fillRect(file * size, rank * size, size, size);
    }
    pieces.forEach((piece, square) => drawPiece(square, piece));
  };
  let moveIndex = 0;
  let timer;
  const play = () => {
    const [from, to, notation, extra] = moves[moveIndex];
    const piece = pieces.get(from);
    if (piece) { pieces.delete(from); pieces.set(to, piece); }
    if (extra) { const rook = pieces.get(extra[0]); if (rook) { pieces.delete(extra[0]); pieces.set(extra[1], rook); } }
    if (moveLabel) moveLabel.textContent = notation;
    draw();
    moveIndex += 1;
    if (moveIndex === moves.length) {
      window.clearInterval(timer);
      window.setTimeout(() => { resetBoard(); draw(); moveIndex = 0; if (moveLabel) moveLabel.textContent = 'Sicilian Dragon / replaying'; timer = window.setInterval(play, 1000); }, 2200);
    }
  };
  resetBoard();
  draw();
  timer = window.setInterval(play, reducedMotion ? 2200 : 1000);
  boardCanvas.addEventListener('click', () => { window.clearInterval(timer); resetBoard(); draw(); moveIndex = 0; if (moveLabel) moveLabel.textContent = 'Sicilian Dragon / replaying'; timer = window.setInterval(play, reducedMotion ? 2200 : 1000); });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();
