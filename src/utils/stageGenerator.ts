import type { Tube, GemColor } from "@/types/game";
import { GEM_COLORS } from "@/constants/gemConfig";
import { GAME_CONFIG } from "@/constants/gameConfig";

/**
 * 스테이지 밸런싱: 2색은 10까지, 빈 시험관은 항상 1개 (numTubes = numColors + 1)
 * - 2색: 1~10 (3튜브 = 2채움 + 1빈)
 * - 3색: 11~90 (4튜브 = 3채움 + 1빈)
 * - 4색: 91~200 (5튜브 = 4채움 + 1빈)
 */
function getStageParams(stageNumber: number): {
  numTubes: number;
  numColors: number;
  capacity: number;
} {
  const capacity = GAME_CONFIG.defaultTubeCapacity;
  if (stageNumber <= 10) return { numTubes: 3, numColors: 2, capacity };
  if (stageNumber <= 90) return { numTubes: 4, numColors: 3, capacity };
  return { numTubes: 5, numColors: 4, capacity };
}

/** 시드 기반 의사 난수 (같은 스테이지면 같은 배치) */
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/** 모든 튜브가 이미 한 색만 있거나 비어 있으면 true */
function isAlreadySolved(tubes: Tube[]): boolean {
  return tubes.every((t) => {
    if (t.gems.length === 0) return true;
    const first = t.gems[0];
    return t.gems.every((g) => g === first);
  });
}

/** 이미 정렬된 상태면, 처음 두 채워진 튜브의 위쪽 절반을 서로 바꿔서 섞인 상태로 만듦 */
function ensureMixed(tubes: Tube[]): void {
  const filled = tubes.filter((t) => t.gems.length > 0);
  if (filled.length < 2) return;
  const t0 = filled[0];
  const t1 = filled[1];
  const half = Math.floor(t0.gems.length / 2);
  if (half === 0) return;
  const from0 = t0.gems.splice(t0.gems.length - half, half);
  const from1 = t1.gems.splice(t1.gems.length - half, half);
  t0.gems.push(...from1);
  t1.gems.push(...from0);
}

/** 한 색당 capacity만큼 채우고, 빈 시험관 1개. 풀 수 있는 형태로 초기 배치 생성 */
export function generateStage(stageNumber: number): Tube[] {
  const { numTubes, numColors, capacity } = getStageParams(stageNumber);
  const colors = GEM_COLORS.slice(0, numColors) as GemColor[];
  const gemStack: GemColor[] = [];
  colors.forEach((c) => {
    for (let i = 0; i < capacity; i++) gemStack.push(c);
  });

  const rng = seededRandom(stageNumber * 12345);
  for (let i = gemStack.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [gemStack[i], gemStack[j]] = [gemStack[j], gemStack[i]];
  }

  const tubes: Tube[] = [];
  const numFilledTubes = numColors;
  let idx = 0;
  for (let t = 0; t < numTubes; t++) {
    const id = `tube-${stageNumber}-${t}`;
    if (t < numFilledTubes) {
      const gems: GemColor[] = [];
      for (let g = 0; g < capacity && idx < gemStack.length; g++) {
        gems.push(gemStack[idx++]);
      }
      tubes.push({ id, gems, capacity });
    } else {
      tubes.push({ id, gems: [], capacity });
    }
  }

  if (isAlreadySolved(tubes)) ensureMixed(tubes);
  return tubes;
}
