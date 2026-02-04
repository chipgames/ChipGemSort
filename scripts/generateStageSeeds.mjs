/**
 * 풀 수 있는 시드를 찾아 stageSeeds.json 생성 (1~200).
 * 실행: node scripts/generateStageSeeds.mjs
 * 기존 파일이 있으면 없는 스테이지만 채움. 중단 후 재실행 가능.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../src/constants/stageSeeds.json");

const CAPACITY = 4;
const GEM_COLORS = [
  "red",
  "yellow",
  "blue",
  "green",
  "purple",
  "orange",
  "cyan",
  "pink",
];

function getStageParams(stageNumber) {
  if (stageNumber <= 10) return { numTubes: 3, numColors: 2, numEmptyTubes: 1 };
  if (stageNumber <= 20) return { numTubes: 5, numColors: 3, numEmptyTubes: 2 };
  if (stageNumber <= 30) return { numTubes: 4, numColors: 3, numEmptyTubes: 1 };
  if (stageNumber <= 40) return { numTubes: 7, numColors: 4, numEmptyTubes: 3 };
  if (stageNumber <= 50) return { numTubes: 6, numColors: 4, numEmptyTubes: 2 };
  if (stageNumber <= 60) return { numTubes: 8, numColors: 5, numEmptyTubes: 3 };
  if (stageNumber <= 70) return { numTubes: 7, numColors: 5, numEmptyTubes: 2 };
  if (stageNumber <= 90) return { numTubes: 9, numColors: 6, numEmptyTubes: 3 };
  if (stageNumber <= 110)
    return { numTubes: 10, numColors: 7, numEmptyTubes: 3 };
  return { numTubes: 11, numColors: 8, numEmptyTubes: 3 };
}

function seededRandom(seed) {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function isAlreadySolved(tubes) {
  return tubes.every((t) => {
    if (t.gems.length === 0) return true;
    const first = t.gems[0];
    return t.gems.every((g) => g === first);
  });
}

function ensureMixed(tubes) {
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

function generateWithSeed(stageNumber, seed) {
  const { numTubes, numColors, numEmptyTubes } = getStageParams(stageNumber);
  const numFilledTubes = numTubes - numEmptyTubes;
  const colors = GEM_COLORS.slice(0, numColors);
  const gemStack = [];
  colors.forEach((c) => {
    for (let i = 0; i < CAPACITY; i++) gemStack.push(c);
  });
  const rng = seededRandom(seed);
  for (let i = gemStack.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [gemStack[i], gemStack[j]] = [gemStack[j], gemStack[i]];
  }
  const tubes = [];
  let idx = 0;
  for (let t = 0; t < numTubes; t++) {
    const id = `tube-${stageNumber}-${t}`;
    if (t < numFilledTubes) {
      const gems = [];
      for (let g = 0; g < CAPACITY && idx < gemStack.length; g++) {
        gems.push(gemStack[idx++]);
      }
      tubes.push({ id, gems, capacity: CAPACITY });
    } else {
      tubes.push({ id, gems: [], capacity: CAPACITY });
    }
  }
  if (isAlreadySolved(tubes)) ensureMixed(tubes);
  return tubes;
}

function pour(tubes, fromIndex, toIndex) {
  if (fromIndex === toIndex) return null;
  const from = tubes[fromIndex];
  const to = tubes[toIndex];
  if (!from || !to || from.gems.length === 0 || to.gems.length >= to.capacity)
    return null;
  const top = from.gems[from.gems.length - 1];
  if (to.gems.length > 0 && to.gems[to.gems.length - 1] !== top) return null;
  let moveCount = 0;
  for (let i = from.gems.length - 1; i >= 0; i--) {
    if (from.gems[i] === top) moveCount++;
    else break;
  }
  const space = to.capacity - to.gems.length;
  moveCount = Math.min(moveCount, space);
  const newTubes = tubes.map((t) => ({ ...t, gems: [...t.gems] }));
  for (let i = 0; i < moveCount; i++) {
    newTubes[fromIndex].gems.pop();
    newTubes[toIndex].gems.push(top);
  }
  return newTubes;
}

function isComplete(tubes) {
  return tubes.every(
    (t) =>
      t.gems.length === 0 ||
      (t.gems.length === t.capacity && new Set(t.gems).size === 1)
  );
}

function stateKey(tubes) {
  const signatures = tubes.map((t) => t.gems.join(","));
  signatures.sort();
  return signatures.join("|");
}

function isSolvable(tubes, maxStates = 80_000) {
  const startKey = stateKey(tubes);
  const visited = new Set([startKey]);
  const queue = [{ tubes, steps: 0 }];
  while (queue.length > 0 && visited.size <= maxStates) {
    const { tubes: current } = queue.shift();
    if (isComplete(current)) return true;
    const n = current.length;
    for (let from = 0; from < n; from++) {
      for (let to = 0; to < n; to++) {
        if (from === to) continue;
        const next = pour(current, from, to);
        if (!next) continue;
        const key = stateKey(next);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ tubes: next, steps: 0 });
      }
    }
  }
  return false;
}

let seeds = {};
if (fs.existsSync(outPath)) {
  seeds = JSON.parse(fs.readFileSync(outPath, "utf8"));
  console.log("Loaded existing seeds for", Object.keys(seeds).length, "stages");
}

const baseSeed = (n) => n * 12345;
const maxAttempts = 200;
const totalStages = 200;

for (let stage = 1; stage <= totalStages; stage++) {
  if (seeds[String(stage)] != null) {
    if (stage % 50 === 0) console.log(`Stage ${stage} (cached)`);
    continue;
  }
  const t0 = Date.now();
  let found = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const seed = baseSeed(stage) + attempt;
    const tubes = generateWithSeed(stage, seed);
    if (isSolvable(tubes)) {
      found = seed;
      break;
    }
  }
  if (found != null) {
    seeds[String(stage)] = found;
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`Stage ${stage} seed=${found} (${elapsed}s)`);
  } else {
    seeds[String(stage)] = baseSeed(stage);
    console.log(`Stage ${stage} fallback seed (no solvable in ${maxAttempts})`);
  }
  fs.writeFileSync(outPath, JSON.stringify(seeds, null, 2), "utf8");
}

console.log("Done. Written to", outPath);
