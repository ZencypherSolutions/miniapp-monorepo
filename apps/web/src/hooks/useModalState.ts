import { useEffect, useState } from "react";

export function useModalState() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Emit modal state changes
  useEffect(() => {
    const event = new CustomEvent("shareModalState", {
      detail: { isOpen: isShareModalOpen },
    });
    window.dispatchEvent(event);
  }, [isShareModalOpen]);

  // Emit advanced insights modal state changes
  useEffect(() => {
    const event = new CustomEvent("shareModalState", {
      detail: { isOpen: isModalOpen },
    });
    window.dispatchEvent(event);
  }, [isModalOpen]);

  // Combined effect to ensure bottom nav stays hidden when either modal is open
  useEffect(() => {
    const isAnyModalOpen = isShareModalOpen || isModalOpen;
    const event = new CustomEvent("shareModalState", {
      detail: { isOpen: isAnyModalOpen },
    });
    window.dispatchEvent(event);
  }, [isShareModalOpen, isModalOpen]);

  return {
    isModalOpen,
    isShareModalOpen,
    setIsModalOpen,
    setIsShareModalOpen,
  };
}