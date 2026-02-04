import { useState, useEffect, useCallback } from "react";
import { storageManager } from "@/utils/storage";

const SOUND_KEY = "chipGemSort_soundEnabled";

const getStoredSoundEnabled = (): boolean => {
  const stored = storageManager.get<boolean>(SOUND_KEY, {
    fallback: true,
    silent: true,
  });
  return stored !== false; // 기본값은 true (소리 켜짐)
};

export const useSound = () => {
  const [enabled, setEnabled] = useState(getStoredSoundEnabled);

  useEffect(() => {
    storageManager.set(SOUND_KEY, enabled, { silent: true });
  }, [enabled]);

  const toggle = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  const playSound = useCallback(
    (type: "click" | "success" | "error" | "move" = "click") => {
      if (!enabled) return;

      // Web Audio API를 사용한 간단한 효과음 생성
      try {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // 타입별 주파수 설정
        const frequencies: Record<string, number> = {
          click: 800,
          move: 600,
          success: 1000,
          error: 400,
        };

        oscillator.frequency.value = frequencies[type] || 800;
        oscillator.type = type === "error" ? "sawtooth" : "sine";

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.1
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } catch (err) {
        // 오디오 컨텍스트 생성 실패 시 무시 (일부 브라우저 제한)
        console.debug("Sound playback failed:", err);
      }
    },
    [enabled]
  );

  return {
    enabled,
    toggle,
    setEnabled,
    playSound,
  };
};
