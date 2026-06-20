export const CELL_SIZE = 64;
export const PADDING = 16;

const FILL_COLORS = [
  '#5b9bd5', '#ed7d31', '#70ad47',
  '#9e7cc1', '#e94f4f', '#ffc000',
  '#00b0c8', '#c55a11', '#548235',
];

export class Grid {
  constructor(rows, cols, lockedCells = []) {
    this.rows = rows;
    this.cols = cols;

    // 0 = 빈 셀, -1 = 잠긴 셀, 양수 = 채워진 지역 색상 인덱스
    this.state = Array.from({ length: rows }, () => Array(cols).fill(0));

    lockedCells.forEach(([r, c]) => {
      if (r >= 0 && r < rows && c >= 0 && c < cols)
        this.state[r][c] = -1;
    });

    this.nextColorIdx = 1;
    this.previewCells = new Set(); // "r,c" 형식
    this.previewValid = false;
  }

  pixelToCell(x, y) {
    return {
      row: Math.floor((y - PADDING) / CELL_SIZE),
      col: Math.floor((x - PADDING) / CELL_SIZE),
    };
  }

  isPlayable(r, c) {
    return r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.state[r][c] !== -1;
  }

  isEmpty(r, c) {
    return this.isPlayable(r, c) && this.state[r][c] === 0;
  }

  fillRegion(cells) {
    const idx = this.nextColorIdx++;
    cells.forEach(([r, c]) => { this.state[r][c] = idx; });
  }

  eraseRegionAt(r, c) {
    const idx = this.state[r][c];
    if (idx <= 0) return;
    for (let row = 0; row < this.rows; row++)
      for (let col = 0; col < this.cols; col++)
        if (this.state[row][col] === idx) this.state[row][col] = 0;
  }

  isComplete() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.state[r][c] === 0) return false;
    return true;
  }

  draw(ctx) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = PADDING + c * CELL_SIZE;
        const y = PADDING + r * CELL_SIZE;
        const st = this.state[r][c];

        if (st === -1) continue; // 보드 바깥

        const isPreview = this.previewCells.has(`${r},${c}`);

        // 셀 배경
        if (st > 0) {
          ctx.fillStyle = FILL_COLORS[(st - 1) % FILL_COLORS.length];
        } else if (isPreview) {
          ctx.fillStyle = this.previewValid
            ? 'rgba(80, 180, 80, 0.5)'
            : 'rgba(200, 60, 60, 0.4)';
        } else {
          ctx.fillStyle = '#f0e9d8';
        }
        ctx.fillRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);

        // 미리보기 해칭 (잘못된 도형)
        if (isPreview && !this.previewValid) {
          this._drawHatch(ctx, x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        }

        // 격자선
        ctx.strokeStyle = '#b09878';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 3]);
        ctx.strokeRect(x + 0.5, y + 0.5, CELL_SIZE, CELL_SIZE);
        ctx.setLineDash([]);
      }
    }

    // 보드 외곽선
    ctx.strokeStyle = '#6b4e2a';
    ctx.lineWidth = 3;
    ctx.strokeRect(PADDING - 1, PADDING - 1,
      this.cols * CELL_SIZE + 2, this.rows * CELL_SIZE + 2);
  }

  _drawHatch(ctx, x, y, w, h) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    ctx.strokeStyle = 'rgba(150, 30, 30, 0.5)';
    ctx.lineWidth = 1.5;
    for (let i = -h; i < w + h; i += 8) {
      ctx.beginPath();
      ctx.moveTo(x + i, y);
      ctx.lineTo(x + i + h, y + h);
      ctx.stroke();
    }
    ctx.restore();
  }
}
