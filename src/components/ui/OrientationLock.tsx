import React from "react";
import { useOrientationLock } from "@/hooks/useOrientationLock";
import { useLanguage } from "@/hooks/useLanguage";
import "./OrientationLock.css";

interface OrientationLockProps {
  className?: string;
}

const OrientationLock: React.FC<OrientationLockProps> = ({ className }) => {
  const { supported, isLocked, lockType, toggle } = useOrientationLock();
  const { t } = useLanguage();

  if (!supported) return null;

  const handleClick = async () => {
    await toggle();
  };

  const getIcon = () => {
    if (isLocked) {
      return lockType === "portrait" ? "🔒📱" : "🔒🖥️";
    }
    return "📱";
  };

  const getLabel = () => {
    if (isLocked) {
      return lockType === "portrait"
        ? t("orientation.unlock")
        : t("orientation.unlock");
    }
    return t("orientation.lock");
  };

  return (
    <button
      type="button"
      className={`orientation-lock-button ${className ?? ""}`}
      onClick={handleClick}
      aria-label={getLabel()}
      title={getLabel()}
    >
      <span className="orientation-lock-icon">{getIcon()}</span>
      <span className="orientation-lock-label">{getLabel()}</span>
    </button>
  );
};

export default OrientationLock;
