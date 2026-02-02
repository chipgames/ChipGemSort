import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/hooks/useLanguage";

const BASE_URL = "https://chipgames.github.io/ChipGemSort/";

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  url = BASE_URL,
  type = "website",
}) => {
  const { language } = useLanguage();
  const finalTitle = title || "ChipGemSort - CHIP GAMES";
  const finalDescription =
    description ||
    "무료 온라인 색상 정렬 퍼즐. 젬을 병에 나눠 담아 한 병에 한 색만!";
  const langParam = language !== "ko" ? `?lang=${language}` : "";
  const finalUrl = url + (url.includes("?") ? "&" : "") + langParam;
  const ogImage = `${BASE_URL}ChipGames_Logo.png`;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <link rel="canonical" href={finalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImage} />
      <link rel="alternate" hrefLang="ko" href={`${BASE_URL}?lang=ko`} />
      <link rel="alternate" hrefLang="en" href={`${BASE_URL}?lang=en`} />
      <link rel="alternate" hrefLang="ja" href={`${BASE_URL}?lang=ja`} />
      <link rel="alternate" hrefLang="zh" href={`${BASE_URL}?lang=zh`} />
    </Helmet>
  );
};

export default SEOHead;
