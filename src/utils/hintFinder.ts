import type { Tube } from "@/types/game";
import { canPour } from "./gameLogic";

/**
 * 다음 가능한 이동을 찾아 반환합니다.
 * @param tubes 현재 튜브 상태
 * @returns { from: number, to: number } | null - 가능한 이동이 없으면 null
 */
export function findHint(tubes: Tube[]): { from: number; to: number } | null {
  const n = tubes.length;
  const possibleMoves: { from: number; to: number; priority: number }[] = [];

  // 모든 가능한 이동 찾기
  for (let from = 0; from < n; from++) {
    for (let to = 0; to < n; to++) {
      if (from === to) continue;
      if (canPour(tubes[from], tubes[to])) {
        // 우선순위 계산
        const priority = calculateMovePriority(tubes, from, to);
        possibleMoves.push({ from, to, priority });
      }
    }
  }

  if (possibleMoves.length === 0) return null;

  // 우선순위가 높은 순으로 정렬
  possibleMoves.sort((a, b) => b.priority - a.priority);

  // 가장 높은 우선순위의 이동 반환
  const bestMove = possibleMoves[0];
  return { from: bestMove.from, to: bestMove.to };
}

/**
 * 이동의 우선순위를 계산합니다.
 * 높은 우선순위 = 더 좋은 이동
 */
function calculateMovePriority(
  tubes: Tube[],
  from: number,
  to: number
): number {
  const fromTube = tubes[from];
  const toTube = tubes[to];
  let priority = 0;

  // 1. 같은 색을 완성하는 이동 (높은 우선순위)
  const topColor = fromTube.gems[fromTube.gems.length - 1];
  const sameColorCount = fromTube.gems.filter((g) => g === topColor).length;
  const toSpace = toTube.capacity - toTube.gems.length;

  // 같은 색 젬을 모두 옮겨서 한 튜브를 완성할 수 있는 경우
  if (
    toTube.gems.length > 0 &&
    toTube.gems[toTube.gems.length - 1] === topColor
  ) {
    const afterMove = toTube.gems.length + Math.min(sameColorCount, toSpace);
    if (afterMove === toTube.capacity) {
      priority += 100; // 완성하는 이동
    } else {
      priority += 50; // 같은 색을 모으는 이동
    }
  }

  // 2. 빈 튜브로 옮기는 경우 (중간 우선순위)
  if (toTube.gems.length === 0) {
    priority += 30;
  }

  // 3. 많은 젬을 한 번에 옮길 수 있는 경우 (낮은 우선순위)
  const moveCount = Math.min(sameColorCount, toSpace);
  priority += moveCount * 2;

  // 4. from 튜브를 비울 수 있는 경우 (추가 보너스)
  if (sameColorCount === fromTube.gems.length && moveCount === sameColorCount) {
    priority += 20;
  }

  return priority;
}
