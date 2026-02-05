import React, { useState, useEffect } from "react";
import { useOrientationLock } from "@/hooks/useOrientationLock";
import "./ScreenOrientationLock.css";

interface ScreenOrientationLockProps {
  className?: string;
}

const STORAGE_KEY = "chipGemSort_screenOrientationLocked";

const ScreenOrientationLock: React.FC<ScreenOrientationLockProps> = ({
  className,
}) => {
  const { supported, isLocked, lockType, lock, unlock } = useOrientationLock();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return (
      window.innerWidth <= 768 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0
    );
  });
  const [isAutoLockEnabled, setIsAutoLockEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved === "true";
    }
    return true; // 기본값: 고정
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth <= 768 ||
          "ontouchstart" in window ||
          navigator.maxTouchPoints > 0
      );
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // 자동 고정 설정 변경 시
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isAutoLockEnabled));
    
    if (!supported || !isMobile) return;

    const applyOrientationLock = async () => {
      if (isAutoLockEnabled) {
        // 고정 활성화: 현재 방향으로 고정
        const currentOrientation =
          Math.abs(window.orientation ?? screen.orientation?.angle ?? 0) === 90
            ? "landscape"
            : "portrait";
        try {
          await lock(currentOrientation);
        } catch (err) {
          console.warn("Failed to lock orientation:", err);
        }
      } else {
        // 고정 해제
        try {
          await unlock();
        } catch (err) {
          console.warn("Failed to unlock orientation:", err);
        }
      }
    };

    applyOrientationLock();
  }, [isAutoLockEnabled, supported, isMobile, lock, unlock]);

  if (!supported || !isMobile) return null;

  const handleClick = () => {
    setIsAutoLockEnabled((prev) => !prev);
  };

  const getIcon = () => {
    return isAutoLockEnabled ? "🔒" : "🔄";
  };

  const getLabel = () => {
    return isAutoLockEnabled ? "고정" : "전환";
  };

  return (
    <button
      type="button"
      className={`screen-orientation-lock-button ${className ?? ""} ${
        isAutoLockEnabled ? "locked" : "unlocked"
      }`}
      onClick={handleClick}
      aria-label={isAutoLockEnabled ? "화면 방향 고정 해제" : "화면 방향 고정"}
      title={isAutoLockEnabled ? "화면 방향 고정 해제" : "화면 방향 고정"}
    >
      <span className="screen-orientation-lock-icon">{getIcon()}</span>
      <span className="screen-orientation-lock-label">{getLabel()}</span>
    </button>
  );
};

export default ScreenOrientationLock;
