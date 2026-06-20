// 좌표 배열을 원점 기준으로 정규화 (최소 row/col = 0, 정렬)
function normalize(cells) {
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  return cells
    .map(([r, c]) => [r - minR, c - minC])
    .sort(([r1, c1], [r2, c2]) => r1 - r2 || c1 - c2);
}

function shapeKey(cells) {
  return JSON.stringify(normalize(cells));
}

// 90도 시계 방향 회전: [r,c] -> [c, -r]
function rotate90(cells) {
  return cells.map(([r, c]) => [c, -r]);
}

// 좌우 반전: [r,c] -> [r, -c]
function flipH(cells) {
  return cells.map(([r, c]) => [r, -c]);
}

// 모든 방향의 정규화된 키 Set 반환 (최대 8가지)
function getAllOrientations(shape) {
  const seen = new Set();
  let cur = shape;
  for (let flip = 0; flip < 2; flip++) {
    for (let rot = 0; rot < 4; rot++) {
      seen.add(shapeKey(cur));
      cur = rotate90(cur);
    }
    cur = flipH(cur);
  }
  return seen;
}

export function validateShape(drawnCells, targetShape) {
  if (drawnCells.length !== targetShape.length) return false;
  const drawnKey = shapeKey(drawnCells);
  return getAllOrientations(targetShape).has(drawnKey);
}
