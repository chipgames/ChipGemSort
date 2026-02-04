import React, { useRef, useEffect, useState, useCallback } from "react";
import "./StageSelectCanvas.css";

const COLS = 10;
const ROWS = 5;

function getHeaderHeight(h: number): number {
  return Math.max(36, Math.min(56, h * 0.1));
}

function getPaginationHeight(h: number): number {
  return Math.max(32, Math.min(48, h * 0.08));
}

export interface StageSelectCanvasProps {
  title: string;
  unlockedStages: number;
  currentPage: number;
  totalPages: number;
  totalStages: number;
  stagesPerPage: number;
  stageRecords?: Record<number, { stars: number; moves: number }>;
  onStartStage: (stageNumber: number) => void;
  onPageChange: (page: number) => void;
}

export const StageSelectCanvas: React.FC<StageSelectCanvasProps> = ({
  title,
  unlockedStages,
  currentPage,
  totalPages,
  totalStages,
  stagesPerPage,
  stageRecords = {},
  onStartStage,
  onPageChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [hoverCell, setHoverCell] = useState<number | null>(null);
  const [hoverBtn, setHoverBtn] = useState<"prev" | "next" | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const startStage = (currentPage - 1) * stagesPerPage + 1;
  const endStage = Math.min(startStage + stagesPerPage - 1, totalStages);
  const cellCount = endStage - startStage + 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = `${size.w}px`;
    canvas.style.height = `${size.h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const headerH = getHeaderHeight(size.h);
    const paginationH = getPaginationHeight(size.h);
    const contentTop = headerH;
    const contentH = size.h - headerH - paginationH;
    const gap = Math.max(4, size.w * 0.012);
    const availableW = size.w - gap * (COLS + 1);
    const availableH = contentH - gap * (ROWS + 1);
    const cellW = availableW / COLS;
    const cellH = availableH / ROWS;
    const cellSize = Math.min(cellW, cellH);
    const totalGridW = COLS * cellSize + (COLS - 1) * gap;
    const totalGridH = ROWS * cellSize + (ROWS - 1) * gap;
    const marginX = (size.w - totalGridW) / 2;
    const marginY = contentTop + (contentH - totalGridH) / 2;

    const bg =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--canvas-bg")
        .trim() || "#1a1a1a";
    const textColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-primary")
        .trim() || "#ffffff";
    const textSecondary =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-secondary")
        .trim() || textColor;
    const borderColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--border-color")
        .trim() || "rgba(255,255,255,0.15)";
    const accentPrimary =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim() || "#a8b5ff";
    const bgCard =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-card")
        .trim() || "rgba(42,42,62,0.9)";
    const bgLocked =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--bg-tertiary")
        .trim() || "rgba(58,58,78,0.9)";

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.w, size.h);

    // Header
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size.w, headerH);
    const headerGrad = ctx.createLinearGradient(0, 0, 0, headerH);
    headerGrad.addColorStop(0, "rgba(255,255,255,0.06)");
    headerGrad.addColorStop(0.5, "rgba(255,255,255,0.02)");
    headerGrad.addColorStop(1, "transparent");
    ctx.fillStyle = headerGrad;
    ctx.fillRect(0, 0, size.w, headerH);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = Math.max(1, size.w / 600);
    ctx.beginPath();
    ctx.moveTo(0, headerH);
    ctx.lineTo(size.w, headerH);
    ctx.stroke();

    const fontFamily =
      "'Noto Sans KR', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";
    const titleFont = Math.max(14, Math.min(22, Math.round(size.w * 0.04)));
    ctx.font = `600 ${titleFont}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,0.3)";
    ctx.shadowOffsetY = 1;
    ctx.shadowBlur = 2;
    ctx.fillText(title, size.w / 2, headerH / 2);
    ctx.shadowColor = "transparent";
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 0;

    const roundRect = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    const numFont = Math.max(10, Math.min(16, Math.round(cellSize * 0.35)));
    const starColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-warning")
        .trim() || "#ffb300";

    for (let i = 0; i < cellCount; i++) {
      const row = Math.floor(i / COLS);
      const col = i % COLS;
      const x = marginX + col * (cellSize + gap);
      const y = marginY + row * (cellSize + gap);
      const num = startStage + i;
      const isUnlocked = num <= unlockedStages;
      const isHover = hoverCell === i && isUnlocked;
      const record = stageRecords[num];

      roundRect(x, y, cellSize, cellSize, Math.min(12, cellSize * 0.2));
      if (isUnlocked) {
        ctx.fillStyle = isHover ? "rgba(168, 181, 255, 0.25)" : bgCard;
        ctx.fill();
        ctx.strokeStyle = isHover ? accentPrimary : borderColor;
      } else {
        ctx.fillStyle = bgLocked;
        ctx.fill();
        ctx.strokeStyle = borderColor;
      }
      ctx.lineWidth = isHover ? 2.5 : 1.5;
      ctx.stroke();

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      if (record) {
        const numY = y + cellSize * 0.38;
        ctx.font = `600 ${numFont}px ${fontFamily}`;
        ctx.fillStyle = isUnlocked ? textColor : textSecondary;
        ctx.fillText(String(num), x + cellSize / 2, numY);
        const starFont = Math.max(8, Math.round(cellSize * 0.2));
        ctx.font = `${starFont}px ${fontFamily}`;
        ctx.fillStyle = starColor;
        ctx.fillText(
          "★".repeat(record.stars) + "☆".repeat(3 - record.stars),
          x + cellSize / 2,
          y + cellSize * 0.62
        );
        const moveFont = Math.max(7, Math.round(cellSize * 0.16));
        ctx.font = `${moveFont}px ${fontFamily}`;
        ctx.fillStyle = textSecondary;
        ctx.fillText(
          String(record.moves),
          x + cellSize / 2,
          y + cellSize * 0.82
        );
      } else {
        ctx.font = `600 ${numFont}px ${fontFamily}`;
        ctx.fillStyle = isUnlocked ? textColor : textSecondary;
        ctx.fillText(String(num), x + cellSize / 2, y + cellSize / 2);
      }
      if (!isUnlocked) {
        const lockFont = Math.max(8, Math.round(cellSize * 0.2));
        ctx.font = `${lockFont}px ${fontFamily}`;
        ctx.fillText("🔒", x + cellSize / 2, y + cellSize * 0.72);
        ctx.font = `600 ${numFont}px ${fontFamily}`;
      }
    }

    // Pagination
    const paginationY = size.h - paginationH;
    ctx.fillStyle = bg;
    ctx.fillRect(0, paginationY, size.w, paginationH);
    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    ctx.moveTo(0, paginationY);
    ctx.lineTo(size.w, paginationY);
    ctx.stroke();

    const btnFont = Math.max(10, Math.min(14, Math.round(size.w * 0.032)));
    ctx.font = `500 ${btnFont}px ${fontFamily}`;
    const pageText = `${currentPage} / ${totalPages}`;
    ctx.fillStyle = textSecondary;
    ctx.textAlign = "center";
    ctx.fillText(pageText, size.w / 2, paginationY + paginationH / 2);

    const btnW = Math.max(64, size.w * 0.12);
    const btnH = paginationH * 0.7;
    const btnRadius = Math.min(8, btnH * 0.4);
    const prevX = size.w / 2 - btnW * 1.2;
    const nextX = size.w / 2 + btnW * 0.2;
    const btnY = paginationY + (paginationH - btnH) / 2;

    const drawBtn = (x: number, label: string, isHover: boolean) => {
      roundRect(x, btnY, btnW, btnH, btnRadius);
      ctx.fillStyle = isHover ? "rgba(168, 181, 255, 0.2)" : bgCard;
      ctx.fill();
      ctx.strokeStyle = isHover ? accentPrimary : borderColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(label, x + btnW / 2, btnY + btnH / 2);
    };
    drawBtn(prevX, "«", hoverBtn === "prev" && currentPage > 1);
    drawBtn(nextX, "»", hoverBtn === "next" && currentPage < totalPages);
  }, [
    size,
    title,
    unlockedStages,
    currentPage,
    totalPages,
    startStage,
    endStage,
    cellCount,
    hoverCell,
    hoverBtn,
    stagesPerPage,
    stageRecords,
  ]);

  const getCellIndexFromXY = useCallback(
    (logicalX: number, logicalY: number): number | null => {
      const headerH = getHeaderHeight(size.h);
      const paginationH = getPaginationHeight(size.h);
      const contentH = size.h - headerH - paginationH;
      const gap = Math.max(4, size.w * 0.012);
      const availableW = size.w - gap * (COLS + 1);
      const availableH = contentH - gap * (ROWS + 1);
      const cellW = availableW / COLS;
      const cellH = availableH / ROWS;
      const cellSize = Math.min(cellW, cellH);
      const totalGridW = COLS * cellSize + (COLS - 1) * gap;
      const totalGridH = ROWS * cellSize + (ROWS - 1) * gap;
      const marginX = (size.w - totalGridW) / 2;
      const marginY = headerH + (contentH - totalGridH) / 2;

      const col = Math.floor((logicalX - marginX + gap / 2) / (cellSize + gap));
      const row = Math.floor((logicalY - marginY + gap / 2) / (cellSize + gap));
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
      const idx = row * COLS + col;
      if (idx >= cellCount) return null;
      return idx;
    },
    [size, cellCount, startStage, endStage]
  );

  const getButtonFromXY = useCallback(
    (logicalX: number, logicalY: number): "prev" | "next" | null => {
      const paginationH = getPaginationHeight(size.h);
      const paginationY = size.h - paginationH;
      const btnW = Math.max(64, size.w * 0.12);
      const btnH = paginationH * 0.7;
      const prevX = size.w / 2 - btnW * 1.2;
      const nextX = size.w / 2 + btnW * 0.2;
      const btnY = paginationY + (paginationH - btnH) / 2;
      if (logicalY < btnY || logicalY > btnY + btnH) return null;
      if (logicalX >= prevX && logicalX <= prevX + btnW) return "prev";
      if (logicalX >= nextX && logicalX <= nextX + btnW) return "next";
      return null;
    },
    [size]
  );

  const handlePointer = useCallback(
    (clientX: number, clientY: number, isClick: boolean) => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const scaleX = size.w / rect.width;
      const scaleY = size.h / rect.height;
      const logicalX = (clientX - rect.left) * scaleX;
      const logicalY = (clientY - rect.top) * scaleY;

      const cellIdx = getCellIndexFromXY(logicalX, logicalY);
      setHoverCell(cellIdx);
      const btn = getButtonFromXY(logicalX, logicalY);
      setHoverBtn(btn);

      if (isClick) {
        if (cellIdx !== null) {
          const num = startStage + cellIdx;
          if (num <= unlockedStages) onStartStage(num);
        } else if (btn === "prev" && currentPage > 1)
          onPageChange(currentPage - 1);
        else if (btn === "next" && currentPage < totalPages)
          onPageChange(currentPage + 1);
      }
    },
    [
      size.w,
      size.h,
      getCellIndexFromXY,
      getButtonFromXY,
      startStage,
      unlockedStages,
      currentPage,
      totalPages,
      onStartStage,
      onPageChange,
    ]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    handlePointer(e.clientX, e.clientY, false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    handlePointer(e.clientX, e.clientY, false);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    handlePointer(e.clientX, e.clientY, true);
    (e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId);
  };
  const onPointerLeave = () => {
    setHoverCell(null);
    setHoverBtn(null);
  };

  return (
    <div
      ref={containerRef}
      className="stage-select-canvas-wrapper"
      role="region"
      aria-label={title}
    >
      <canvas
        ref={canvasRef}
        className="stage-select-canvas"
        width={size.w}
        height={size.h}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
        onPointerCancel={onPointerLeave}
      />
    </div>
  );
};
