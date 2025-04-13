'use client'

import { FilledButton } from "@/components/ui/buttons/FilledButton";
import { useVerification } from "@/hooks";
import { useTranslation } from "@/i18n";

export function BannerTop() {
  const { isVerifying, isVerified, isLoading, handleVerify } = useVerification();
  const { t } = useTranslation();

  if (isLoading || isVerified) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-brand-tertiary z-50 px-4 py-2 flex flex-col items-center justify-center">
      <FilledButton
        variant="primary"
        size="sm"
        className="w-full bg-[#e36c59] hover:bg-[#e36c59]/90 text-sm"
        onClick={handleVerify}
        disabled={isVerifying}
      >
        {isVerifying ? t('verification.verifying') : t('verification.verifyWorldId')}
      </FilledButton>
    </div>
  );
}
