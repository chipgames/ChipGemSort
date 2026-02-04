import type { GemColor } from "@/types/game";
import { GEM_COLOR_HEX } from "@/constants/gemConfig";

/** ChipPuzzleGame 스타일: 둥근 사각형 + 색상별 내부 패턴(원·별·다이아몬드·삼각형·사각형·육각형) */
export function drawGem(
  ctx: CanvasRenderingContext2D,
  color: GemColor,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const colors = GEM_COLOR_HEX[color];
  // 보석은 항상 정사각형으로 강제 (모바일에서 비율 깨짐 방지)
  const baseSize = Math.min(width, height);
  const pad = baseSize * 0.05;
  const size = baseSize - pad * 2;
  const rx = size * 0.2;
  const centerX = x + pad + size / 2;
  const centerY = y + pad + size / 2;

  ctx.save();

  // 그림자
  ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
  roundRect(ctx, x + pad + 2, y + pad + 2, size, size, rx, rx);
  ctx.fill();

  // 메인 젬 그라데이션
  ctx.shadowColor = "rgba(0,0,0,0.2)";
  ctx.shadowOffsetY = 2;
  ctx.shadowBlur = 4;
  const grad = ctx.createLinearGradient(
    x + pad,
    y + pad,
    x + pad + size,
    y + pad + size
  );
  grad.addColorStop(0, colors.light);
  grad.addColorStop(1, colors.dark);
  ctx.fillStyle = grad;
  roundRect(ctx, x + pad, y + pad, size, size, rx, rx);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.shadowOffsetY = 0;
  ctx.shadowBlur = 0;

  // 색상별 내부 패턴 (ChipPuzzleGame과 동일: 원·별·다이아몬드·삼각형·사각형·육각형)
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.globalAlpha = 0.55;
  renderColorPattern(ctx, color, size);
  ctx.restore();

  // 상단 하이라이트
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  roundRect(ctx, x + pad, y + pad, size, size * 0.4, rx, rx);
  ctx.fill();

  // 테두리
  ctx.strokeStyle = getBorderColor(color);
  ctx.lineWidth = Math.max(1, size * 0.06);
  roundRect(ctx, x + pad, y + pad, size, size, rx, rx);
  ctx.stroke();

  ctx.restore();
}

function getBorderColor(color: GemColor): string {
  const map: Record<GemColor, string> = {
    red: "rgba(231, 76, 60, 0.9)",
    yellow: "rgba(241, 196, 15, 0.9)",
    blue: "rgba(52, 152, 219, 0.9)",
    green: "rgba(46, 204, 113, 0.9)",
    purple: "rgba(155, 89, 182, 0.9)",
    orange: "rgba(230, 126, 34, 0.9)",
    cyan: "rgba(0, 188, 212, 0.9)",
    pink: "rgba(233, 30, 99, 0.9)",
  };
  return map[color];
}

function renderColorPattern(
  ctx: CanvasRenderingContext2D,
  color: GemColor,
  size: number
): void {
  const s = size * 0.85;
  switch (color) {
    case "red":
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(192, 57, 43, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "yellow":
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      drawStar(ctx, 0, 0, s * 0.1, s * 0.18, 5);
      ctx.fill();
      break;
    case "blue":
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.18);
      ctx.lineTo(s * 0.18, 0);
      ctx.lineTo(0, s * 0.18);
      ctx.lineTo(-s * 0.18, 0);
      ctx.closePath();
      ctx.fill();
      break;
    case "green":
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.18);
      ctx.lineTo(-s * 0.15, s * 0.12);
      ctx.lineTo(s * 0.15, s * 0.12);
      ctx.closePath();
      ctx.fill();
      break;
    case "purple":
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillRect(-s * 0.12, -s * 0.12, s * 0.24, s * 0.24);
      break;
    case "orange":
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = Math.cos(angle) * s * 0.15;
        const py = Math.sin(angle) * s * 0.15;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(211, 84, 0, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "cyan":
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(0, 151, 167, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "pink":
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      const arm = s * 0.12;
      ctx.fillRect(-arm * 0.4, -arm, arm * 0.8, arm * 2);
      ctx.fillRect(-arm, -arm * 0.4, arm * 2, arm * 0.8);
      ctx.fillStyle = "rgba(194, 24, 91, 0.5)";
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  points: number
): void {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = cx + Math.cos(angle) * r;
    const py = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  rx: number,
  ry: number
): void {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, rx);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + rx, y);
  ctx.lineTo(x + w - rx, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + ry);
  ctx.lineTo(x + w, y + h - ry);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h);
  ctx.lineTo(x + rx, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - ry);
  ctx.lineTo(x, y + ry);
  ctx.quadraticCurveTo(x, y, x + rx, y);
  ctx.closePath();
}
