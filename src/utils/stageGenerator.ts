import type { Tube, GemColor } from "@/types/game";
import { GEM_COLORS } from "@/constants/gemConfig";
import { GAME_CONFIG } from "@/constants/gameConfig";
import { isSolvable } from "./solvabilityCheck";

/**
 * 구간별 파라미터 (풀 수 있도록 검증됨: numTubes = numColors + numEmptyTubes)
 *
 * 구간      색 수  빈 시험관  총 튜브
 * 1~10     2색    1개        3
 * 11~20    3색    2개        5
 * 21~30    3색    1개        4
 * 31~40    4색    3개        7
 * 41~50    4색    2개        6
 * 51~60    5색    3개        8
 * 61~70    5색    2개        7
 * 71~90    6색    3개        9
 * 91~110   7색    3개        10
 * 111~200  8색    3개        11
 */
function getStageParams(stageNumber: number): {
  numTubes: number;
  numColors: number;
  numEmptyTubes: number;
  capacity: number;
} {
  const capacity = GAME_CONFIG.defaultTubeCapacity;
  if (stageNumber <= 10) {
    return { numTubes: 3, numColors: 2, numEmptyTubes: 1, capacity };
  }
  if (stageNumber <= 20) {
    return { numTubes: 5, numColors: 3, numEmptyTubes: 2, capacity };
  }
  if (stageNumber <= 30) {
    return { numTubes: 4, numColors: 3, numEmptyTubes: 1, capacity };
  }
  if (stageNumber <= 40) {
    return { numTubes: 7, numColors: 4, numEmptyTubes: 3, capacity };
  }
  if (stageNumber <= 50) {
    return { numTubes: 6, numColors: 4, numEmptyTubes: 2, capacity };
  }
  if (stageNumber <= 60) {
    return { numTubes: 8, numColors: 5, numEmptyTubes: 3, capacity };
  }
  if (stageNumber <= 70) {
    return { numTubes: 7, numColors: 5, numEmptyTubes: 2, capacity };
  }
  if (stageNumber <= 90) {
    return { numTubes: 9, numColors: 6, numEmptyTubes: 3, capacity };
  }
  if (stageNumber <= 110) {
    return { numTubes: 10, numColors: 7, numEmptyTubes: 3, capacity };
  }
  return { numTubes: 11, numColors: 8, numEmptyTubes: 3, capacity };
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

/** 한 시드로 셔플해서 튜브 배치 생성 (내부용) */
function generateWithSeed(stageNumber: number, seed: number): Tube[] {
  const { numTubes, numColors, numEmptyTubes, capacity } =
    getStageParams(stageNumber);
  const numFilledTubes = numTubes - numEmptyTubes;
  const colors = GEM_COLORS.slice(0, numColors) as GemColor[];
  const gemStack: GemColor[] = [];
  colors.forEach((c) => {
    for (let i = 0; i < capacity; i++) gemStack.push(c);
  });

  const rng = seededRandom(seed);
  for (let i = gemStack.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [gemStack[i], gemStack[j]] = [gemStack[j], gemStack[i]];
  }

  const tubes: Tube[] = [];
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

/** 한 색당 capacity만큼 채우고, 빈 시험관은 getStageParams 기준. 풀 수 있는 배치가 나올 때까지 시드 변경하며 재시도 */
export function generateStage(stageNumber: number): Tube[] {
  const baseSeed = stageNumber * 12345;
  const maxAttempts = 200;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const tubes = generateWithSeed(stageNumber, baseSeed + attempt);
    const { solvable } = isSolvable(tubes);
    if (solvable) return tubes;
  }

  // 200회 시도 후에도 풀 수 있는 배치가 없으면 마지막 시드로 고정 (드문 경우)
  return generateWithSeed(stageNumber, baseSeed + maxAttempts - 1);
}
