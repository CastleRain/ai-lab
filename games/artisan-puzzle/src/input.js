export class InputHandler {
  constructor(canvas, grid, onComplete, onPreview) {
    this.canvas = canvas;
    this.grid = grid;
    this.onComplete = onComplete;
    this.onPreview = onPreview;

    this.isDrawing = false;
    this.isErasing = false;
    this.stroke = new Set(); // "r,c" 문자열

    canvas.addEventListener('mousedown', e => this._down(e));
    canvas.addEventListener('mousemove', e => this._move(e));
    canvas.addEventListener('mouseup',   e => this._up(e));
    canvas.addEventListener('mouseleave',e => this._up(e));
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  _pos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return this.grid.pixelToCell(e.clientX - rect.left, e.clientY - rect.top);
  }

  _cellsArray() {
    return [...this.stroke].map(k => k.split(',').map(Number));
  }

  _down(e) {
    const { row, col } = this._pos(e);
    if (e.button === 2) {
      if (this.grid.isPlayable(row, col)) {
        this.isErasing = true;
        this.grid.eraseRegionAt(row, col);
      }
    } else if (e.button === 0) {
      if (this.grid.isEmpty(row, col)) {
        this.isDrawing = true;
        this.stroke.clear();
        this.stroke.add(`${row},${col}`);
        this._updatePreview();
      }
    }
  }

  _move(e) {
    const { row, col } = this._pos(e);
    if (this.isErasing) {
      if (this.grid.isPlayable(row, col)) this.grid.eraseRegionAt(row, col);
    } else if (this.isDrawing) {
      if (this.grid.isEmpty(row, col)) {
        this.stroke.add(`${row},${col}`);
        this._updatePreview();
      }
    }
  }

  _up(e) {
    if (this.isDrawing && this.stroke.size > 0) {
      this.onComplete(this._cellsArray());
    }
    this.isDrawing = false;
    this.isErasing = false;
    this.stroke.clear();
    this.grid.previewCells = new Set();
  }

  _updatePreview() {
    this.grid.previewCells = new Set(this.stroke);
    this.grid.previewValid = this.onPreview(this._cellsArray());
  }
}
