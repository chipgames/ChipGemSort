import type { Tube } from "@/types/game";
import { pour, isComplete } from "./gameLogic";

/** 상태를 비교용 문자열로 만듦 (튜브 순서 무관: 같은 내용이면 동일 키) */
function stateKey(tubes: Tube[]): string {
  const signatures = tubes.map((t) => t.gems.join(","));
  signatures.sort();
  return signatures.join("|");
}

/** BFS로 해결 가능한지 검사. 최대 탐색 수 제한으로 무한 루프 방지 */
export function isSolvable(
  tubes: Tube[],
  maxStates = 50_000
): { solvable: boolean; stepsToSolve?: number } {
  const startKey = stateKey(tubes);
  const visited = new Set<string>([startKey]);
  const queue: { tubes: Tube[]; steps: number }[] = [{ tubes, steps: 0 }];

  while (queue.length > 0 && visited.size <= maxStates) {
    const { tubes: current, steps } = queue.shift()!;
    if (isComplete(current)) return { solvable: true, stepsToSolve: steps };

    const n = current.length;
    for (let from = 0; from < n; from++) {
      for (let to = 0; to < n; to++) {
        if (from === to) continue;
        const next = pour(current, from, to);
        if (!next) continue;
        const key = stateKey(next);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ tubes: next, steps: steps + 1 });
      }
    }
  }

  return { solvable: visited.size > maxStates ? false : false };
}
