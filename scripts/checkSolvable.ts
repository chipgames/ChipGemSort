/**
 * 스테이지 21, 25 풀 수 있는지 BFS로 검증
 * 실행: npx tsx scripts/checkSolvable.ts
 */
import { generateStage } from "../src/utils/stageGenerator";
import { isSolvable } from "../src/utils/solvabilityCheck";

function run(stageNumber: number) {
  const tubes = generateStage(stageNumber);
  const result = isSolvable(tubes);
  console.log(
    `스테이지 ${stageNumber}: ${
      result.solvable ? "✅ 풀 수 있음" : "❌ 풀 수 없음"
    }${result.stepsToSolve != null ? ` (${result.stepsToSolve}수 이동)` : ""}`
  );
  if (!result.solvable) {
    console.log(
      "  초기 배치:",
      tubes.map((t) => t.gems)
    );
  }
  return result.solvable;
}

console.log("=== 21·25 스테이지 풀 수 있는지 검증 ===\n");
const ok21 = run(21);
const ok25 = run(25);
console.log(
  "\n결과:",
  ok21 && ok25
    ? "두 스테이지 모두 풀 수 있습니다."
    : "풀 수 없는 스테이지가 있습니다."
);
