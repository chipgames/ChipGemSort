import React from "react";
import { useSound } from "@/hooks/useSound";
import { useLanguage } from "@/hooks/useLanguage";
import "./SoundToggle.css";

const SoundToggle: React.FC = () => {
  const { enabled, toggle } = useSound();
  const { t } = useLanguage();

  return (
    <button
      type="button"
      className={`sound-toggle ${enabled ? "enabled" : "disabled"}`}
      onClick={toggle}
      aria-label={enabled ? t("sound.off") : t("sound.on")}
      title={enabled ? t("sound.off") : t("sound.on")}
    >
      <span className="sound-toggle-icon">{enabled ? "🔊" : "🔇"}</span>
      <span className="sound-toggle-label">
        {enabled ? t("sound.on") : t("sound.off")}
      </span>
    </button>
  );
};

export default SoundToggle;
