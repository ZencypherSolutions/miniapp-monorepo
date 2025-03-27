"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { useTranslation } from "@/i18n";

// Components
import { Header } from "@/components/ui/InsightsHeader";
import { InsightsList } from "@/components/ui/InsightsList";
import { ShareModal } from "@/components/ui/overlays/ShareModal";
import { AdvancedInsightsModal } from "@/components/ui/overlays/AdvancedInsightsModal";

// Hooks
import { useModalState } from "@/hooks/useModalState";
import { useInsightsData } from "@/hooks/useInsightsData";
import { useGeminiAnalysis } from "@/hooks/useGeminiAnalysis";
import { useInstagramShare } from "@/hooks/useInstagramShare";

export default function InsightsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");
  const langParam = searchParams.get("lang");
  const { language } = useTranslation();
  
  // Custom hooks
  const { isModalOpen, isShareModalOpen, setIsModalOpen, setIsShareModalOpen } = useModalState();
  const { 
    insights, 
    ideology, 
    scores, 
    publicFigure, 
    isProUser, 
    loading 
  } = useInsightsData(testId);
  
  // Move debug logs to useEffect to prevent render loops
  const debugLoggedRef = useRef(false);
  
  useEffect(() => {
    if (!loading && !debugLoggedRef.current) {
      console.log('Insights Page - Current language:', langParam || language);
      console.log('Insights Page - Ideology:', ideology);
      console.log('Insights Page - Public Figure:', publicFigure);
      debugLoggedRef.current = true;
    }
  }, [loading, langParam, language, ideology, publicFigure]);
  
  // Reset debug logged flag when key values change
  useEffect(() => {
    if (ideology !== undefined || publicFigure !== undefined || (langParam || language)) {
      debugLoggedRef.current = false;
    }
  }, [ideology, publicFigure, langParam, language]);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCanvasLoading, setIsCanvasLoading] = useState(true);
  
  const { fullAnalysis, isGeminiLoading } = useGeminiAnalysis(isProUser, isModalOpen, scores);
  const { handleInstagramShare } = useInstagramShare(canvasRef);

  // Event handlers
  const handleAdvancedInsightsClick = () => setIsModalOpen(true);
  const handleShareClick = () => setIsShareModalOpen(true);
  const handleShareAnalysis = () => {
    setIsShareModalOpen(true);
    setTimeout(() => setIsModalOpen(false), 50);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <Header 
        ideology={ideology}
        isProUser={isProUser}
        onAdvancedInsightsClick={handleAdvancedInsightsClick}
      />

      <InsightsList 
        insights={insights}
        onShareClick={handleShareClick}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        canvasRef={canvasRef}
        scores={scores}
        publicFigure={publicFigure}
        ideology={ideology}
        onShare={handleInstagramShare}
        isCanvasLoading={isCanvasLoading}
        onCanvasLoad={() => setIsCanvasLoading(false)}
      />

      <AdvancedInsightsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isProUser={isProUser}
        fullAnalysis={fullAnalysis}
        isGeminiLoading={isGeminiLoading}
        onShareAnalysis={handleShareAnalysis}
        onUpgradeToPro={() => router.push("/awaken-pro")}
      />

      {/* Emit modal state for bottom nav visibility */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dispatchEvent(new CustomEvent('modalState', { 
              detail: { isOpen: ${isModalOpen} }
            }));
          `,
        }}
      />
    </div>
  );
}
