import React from "react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/hooks/useLanguage";

const BASE_URL = "https://chipgames.github.io/ChipGemSort/";

interface SEOHeadProps {
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

const keywordsByLang: Record<string, string> = {
  ko: "색상정렬, 퍼즐게임, 워터소트, 무료게임, ChipGemSort, 색상 퍼즐, 정렬 게임, 온라인 게임, 브라우저 게임, 퍼즐, 색깔 정렬, 젬 정렬, 병 정렬",
  en: "color sort, puzzle game, water sort, free game, ChipGemSort, color puzzle, sort game, online game, browser game, puzzle, gem sort, tube sort",
  ja: "カラーソート, パズルゲーム, ウォーターソート, 無料ゲーム, ChipGemSort, カラーパズル, ソートゲーム, オンラインゲーム, ブラウザゲーム, パズル, ジェムソート, 試験管ソート",
  zh: "颜色排序, 拼图游戏, 水排序, 免费游戏, ChipGemSort, 颜色拼图, 排序游戏, 在线游戏, 浏览器游戏, 拼图, 宝石排序, 试管排序",
};

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  url = BASE_URL,
  type = "website",
  keywords,
}) => {
  const { language } = useLanguage();
  const finalTitle = title || "ChipGemSort - CHIP GAMES";
  const finalDescription =
    description ||
    "무료 온라인 색상 정렬 퍼즐. 젬을 병에 나눠 담아 한 병에 한 색만!";
  const finalKeywords =
    keywords || keywordsByLang[language] || keywordsByLang.ko;
  const langParam = language !== "ko" ? `?lang=${language}` : "";
  const finalUrl = url + (url.includes("?") ? "&" : "") + langParam;
  const ogImage = `${BASE_URL}ChipGames_Logo.png`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: "ChipGemSort",
    alternateName: "색상 정렬 퍼즐",
    description: finalDescription,
    url: finalUrl,
    image: ogImage,
    applicationCategory: "Game",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "CHIP GAMES",
      url: "https://chipgames.github.io",
    },
    inLanguage: language,
    gamePlatform: ["Web Browser", "Mobile Browser"],
    genre: "Puzzle",
  };

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
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
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default SEOHead;
