import type { Tube, GemColor } from "@/types/game";

/** fromTube의 맨 위 젬을 toTube로 옮길 수 있는지 */
export function canPour(from: Tube, to: Tube): boolean {
  if (from.gems.length === 0) return false;
  if (to.gems.length >= to.capacity) return false;
  const top = from.gems[from.gems.length - 1];
  if (to.gems.length === 0) return true;
  return to.gems[to.gems.length - 1] === top;
}

/** 한 번에 옮길 수 있는 같은 색 연속 개수 (맨 위만) */
export function pourAmount(from: Tube, to: Tube): number {
  if (from.gems.length === 0) return 0;
  const top: GemColor = from.gems[from.gems.length - 1];
  let count = 0;
  for (let i = from.gems.length - 1; i >= 0; i--) {
    if (from.gems[i] === top) count++;
    else break;
  }
  const space = to.capacity - to.gems.length;
  return Math.min(count, space);
}

/** from 인덱스에서 to 인덱스로 한 번 붓기. 반환: 새 tubes 배열 또는 null(불가) */
export function pour(
  tubes: Tube[],
  fromIndex: number,
  toIndex: number
): Tube[] | null {
  if (fromIndex === toIndex) return null;
  const from = tubes[fromIndex];
  const to = tubes[toIndex];
  if (!from || !to || !canPour(from, to)) return null;

  const top: GemColor = from.gems[from.gems.length - 1];
  let moveCount = 0;
  for (let i = from.gems.length - 1; i >= 0; i--) {
    if (from.gems[i] === top) moveCount++;
    else break;
  }
  const space = to.capacity - to.gems.length;
  moveCount = Math.min(moveCount, space);

  const newTubes = tubes.map((t) => ({
    ...t,
    gems: [...t.gems],
  }));

  for (let i = 0; i < moveCount; i++) {
    newTubes[fromIndex].gems.pop();
    newTubes[toIndex].gems.push(top);
  }

  return newTubes;
}

/** 모든 튜브가 한 색만 있거나 비어 있으면 클리어 */
export function isComplete(tubes: Tube[]): boolean {
  return tubes.every(
    (t) =>
      t.gems.length === 0 ||
      (t.gems.length === t.capacity && new Set(t.gems).size === 1)
  );
}
