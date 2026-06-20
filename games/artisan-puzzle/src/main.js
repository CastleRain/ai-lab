import { Grid, CELL_SIZE, PADDING } from './grid.js';
import { InputHandler } from './input.js';
import { validateShape } from './validator.js';
import { LEVELS } from './levels.js';

const SHAPE_CELL = 34;
const SHAPE_PAD = 10;

class Game {
  constructor() {
    this.canvas    = document.getElementById('gameCanvas');
    this.ctx       = this.canvas.getContext('2d');
    this.shapeCanvas = document.getElementById('shapeCanvas');
    this.shapeCtx  = this.shapeCanvas.getContext('2d');
    this.statusEl  = document.getElementById('statusMsg');
    this.alertEl   = document.getElementById('shapeAlert');

    this.levelIdx  = 0;
    this._load(LEVELS[this.levelIdx]);
    this._loop();
  }

  _load(level) {
    this.level = level;
    this.grid = new Grid(level.gridRows, level.gridCols, level.lockedCells || []);

    this.canvas.width  = PADDING * 2 + level.gridCols * CELL_SIZE;
    this.canvas.height = PADDING * 2 + level.gridRows * CELL_SIZE;

    this.input = new InputHandler(
      this.canvas,
      this.grid,
      cells => this._onStroke(cells),
      cells => validateShape(cells, level.targetShape),
    );

    this._drawShapeRef();
    this._setStatus('');
    this.alertEl.classList.add('hidden');
    document.getElementById('hint-bar').textContent =
      `${level.name} — 구역을 클릭한 채로 드래그하여 도형을 그리세요.`;
  }

  _onStroke(cells) {
    if (validateShape(cells, this.level.targetShape)) {
      this.grid.fillRegion(cells);
      this.alertEl.classList.add('hidden');
      this._setStatus('✓ 정확한 도형!', 'ok');

      if (this.grid.isComplete()) {
        setTimeout(() => {
          this._setStatus('🎉 레벨 클리어!', 'ok');
          const next = this.levelIdx + 1;
          if (next < LEVELS.length) {
            setTimeout(() => {
              this.levelIdx = next;
              this._load(LEVELS[this.levelIdx]);
            }, 1400);
          }
        }, 150);
      }
    } else {
      this.alertEl.classList.remove('hidden');
      this._setStatus('✗ 도형이 맞지 않습니다.', 'err');
      setTimeout(() => {
        this.alertEl.classList.add('hidden');
        this._setStatus('');
      }, 1500);
    }
  }

  _setStatus(msg, type = '') {
    this.statusEl.textContent = msg;
    this.statusEl.className = type ? `status-${type}` : '';
  }

  _drawShapeRef() {
    const shape = this.level.targetShape;
    const maxR = Math.max(...shape.map(([r]) => r)) + 1;
    const maxC = Math.max(...shape.map(([, c]) => c)) + 1;
    const w = SHAPE_PAD * 2 + maxC * SHAPE_CELL;
    const h = SHAPE_PAD * 2 + maxR * SHAPE_CELL;

    this.shapeCanvas.width  = w;
    this.shapeCanvas.height = h;

    const ctx = this.shapeCtx;
    ctx.clearRect(0, 0, w, h);

    shape.forEach(([r, c]) => {
      const x = SHAPE_PAD + c * SHAPE_CELL;
      const y = SHAPE_PAD + r * SHAPE_CELL;

      // 배경
      ctx.fillStyle = '#d8ccb0';
      ctx.fillRect(x, y, SHAPE_CELL - 1, SHAPE_CELL - 1);

      // 해칭 무늬
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, SHAPE_CELL - 1, SHAPE_CELL - 1);
      ctx.clip();
      ctx.strokeStyle = '#a09070';
      ctx.lineWidth = 1;
      for (let i = -SHAPE_CELL; i < SHAPE_CELL * 2; i += 7) {
        ctx.beginPath();
        ctx.moveTo(x + i, y);
        ctx.lineTo(x + i + SHAPE_CELL, y + SHAPE_CELL);
        ctx.stroke();
      }
      ctx.restore();

      // 테두리
      ctx.strokeStyle = '#6b4e2a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 0.5, y + 0.5, SHAPE_CELL - 1, SHAPE_CELL - 1);
    });
  }

  _loop() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.grid.draw(this.ctx);
    requestAnimationFrame(() => this._loop());
  }
}

window.addEventListener('DOMContentLoaded', () => new Game());
