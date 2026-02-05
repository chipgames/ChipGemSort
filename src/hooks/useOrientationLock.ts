import { useState, useEffect, useCallback } from "react";

export type OrientationLockType = "portrait" | "landscape" | null;

/** Screen Orientation API lock/unlock (DOM 타입과 호환용) */
type OrientWithLock = {
  lock?(orientation: string): Promise<void>;
  unlock?(): Promise<void>;
};

const getOrientation = (): OrientWithLock | null =>
  typeof screen !== "undefined" && "orientation" in screen
    ? (screen.orientation as unknown as OrientWithLock)
    : null;

const isSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  const orient = getOrientation();
  return (
    orient != null && orient.lock != null && typeof orient.lock === "function"
  );
};

const getCurrentOrientation = (): OrientationLockType => {
  if (typeof window === "undefined") return null;
  const angle = window.orientation ?? screen.orientation?.angle ?? 0;
  return Math.abs(angle) === 90 ? "landscape" : "portrait";
};

export const useOrientationLock = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockType, setLockType] = useState<OrientationLockType>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(isSupported());
    if (supported) {
      const current = getCurrentOrientation();
      setLockType(current);
    }
  }, [supported]);

  useEffect(() => {
    if (!supported) return;

    const handleChange = () => {
      const current = getCurrentOrientation();
      setLockType(current);
    };

    window.addEventListener("orientationchange", handleChange);
    screen.orientation?.addEventListener("change", handleChange);

    return () => {
      window.removeEventListener("orientationchange", handleChange);
      screen.orientation?.removeEventListener("change", handleChange);
    };
  }, [supported]);

  const lock = useCallback(
    async (type: "portrait" | "landscape"): Promise<boolean> => {
      if (!supported) return false;
      try {
        const orient = getOrientation();
        if (orient?.lock) {
          // "any"도 시도해보기 (일부 브라우저에서 더 잘 작동)
          try {
            await orient.lock(type);
          } catch (err) {
            // 특정 방향 실패 시 "any" 시도
            try {
              await orient.lock("any");
            } catch (err2) {
              throw err; // 원래 에러 throw
            }
          }
        }
        setIsLocked(true);
        setLockType(type);
        return true;
      } catch (err) {
        // iOS Safari 등에서는 lock이 작동하지 않을 수 있음
        console.warn("Failed to lock orientation:", err);
        return false;
      }
    },
    [supported]
  );

  const unlock = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    try {
      const orient = getOrientation();
      if (orient?.unlock) await orient.unlock();
      setIsLocked(false);
      setLockType(getCurrentOrientation());
      return true;
    } catch (err) {
      console.warn("Failed to unlock orientation:", err);
      return false;
    }
  }, [supported]);

  const toggle = useCallback(
    async (preferredType?: "portrait" | "landscape"): Promise<boolean> => {
      if (isLocked) {
        return await unlock();
      } else {
        const targetType =
          preferredType ?? (lockType === "portrait" ? "landscape" : "portrait");
        return await lock(targetType);
      }
    },
    [isLocked, lockType, lock, unlock]
  );

  return {
    supported,
    isLocked,
    lockType,
    lock,
    unlock,
    toggle,
  };
};
