export const LEVELS = [
  {
    id: 1,
    name: "Level 1 - 정사각형",
    gridRows: 4,
    gridCols: 4,
    lockedCells: [],
    // 2x2 정사각형
    targetShape: [[0,0],[0,1],[1,0],[1,1]],
  },
  {
    id: 2,
    name: "Level 2 - 일자",
    gridRows: 4,
    gridCols: 4,
    lockedCells: [],
    // 1x4 일자 (회전하면 세로도 가능)
    targetShape: [[0,0],[0,1],[0,2],[0,3]],
  },
  {
    id: 3,
    name: "Level 3 - L자",
    gridRows: 4,
    gridCols: 6,
    // 십자 모양 보드 (귀퉁이 4칸 제거)
    lockedCells: [
      [0,0],[0,1],[0,4],[0,5],
      [3,0],[3,1],[3,4],[3,5],
    ],
    // L-트로미노 (3칸)
    targetShape: [[0,0],[1,0],[1,1]],
  },
];
