import { useState, useEffect, useCallback } from "react";

export type OrientationLockType = "portrait" | "landscape" | null;

const isSupported = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    "orientation" in screen &&
    "lock" in screen.orientation &&
    typeof screen.orientation.lock === "function"
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
        await screen.orientation.lock(type);
        setIsLocked(true);
        setLockType(type);
        return true;
      } catch (err) {
        console.warn("Failed to lock orientation:", err);
        return false;
      }
    },
    [supported]
  );

  const unlock = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    try {
      await screen.orientation.unlock();
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
