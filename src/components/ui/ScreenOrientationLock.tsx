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
  const { supported, lock, unlock } = useOrientationLock();
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

  // 고정 활성화 시 방향 변경 감지하여 자동으로 다시 고정
  useEffect(() => {
    if (!supported || !isMobile || !isAutoLockEnabled) return;

    const handleOrientationChange = async () => {
      // 약간의 지연 후 현재 방향으로 다시 고정 시도
      setTimeout(async () => {
        const currentOrientation =
          Math.abs(window.orientation ?? screen.orientation?.angle ?? 0) === 90
            ? "landscape"
            : "portrait";
        try {
          await lock(currentOrientation);
        } catch (err) {
          // 조용히 실패 (너무 많은 로그 방지)
        }
      }, 100);
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    if (screen.orientation) {
      screen.orientation.addEventListener("change", handleOrientationChange);
    }

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener("change", handleOrientationChange);
      }
    };
  }, [supported, isMobile, isAutoLockEnabled, lock]);

  if (!supported || !isMobile) return null;

  const handleClick = async () => {
    const newValue = !isAutoLockEnabled;
    setIsAutoLockEnabled(newValue);
    
    // 즉시 lock/unlock 실행 (useEffect와 별도로)
    if (supported && isMobile) {
      if (newValue) {
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
    }
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
