import React, { useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import "./OfflineBanner.css";

const OfflineBanner: React.FC = () => {
  const { t } = useLanguage();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      className="offline-banner"
      role="status"
      aria-live="polite"
      aria-label={t("offline.message")}
    >
      <span className="offline-banner-icon" aria-hidden="true">
        📴
      </span>
      <span className="offline-banner-text">{t("offline.message")}</span>
    </div>
  );
};

export default OfflineBanner;
