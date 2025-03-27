"use client";

import type { ISuccessResult, VerifyCommandInput } from "@worldcoin/minikit-js";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "@/i18n";

// Utility function to clear verification session data
export function clearVerificationSession() {
  if (typeof window !== "undefined") {
    // Save language preference
    const languagePreference = localStorage.getItem("language");
    
    // Clear session storage except for language-related items
    const keysToKeep = ['language'];
    Object.keys(sessionStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear cookies directly without making an API call
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName && cookieName !== "language") {
        document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }
    }
    
    // Restore language preference if it existed
    if (languagePreference) {
      localStorage.setItem("language", languagePreference);
    }
  }
}

// Helper function to preserve language preference
function preserveLanguagePreference(callback: () => void) {
  if (typeof window !== "undefined") {
    // Save language preference
    const languagePreference = localStorage.getItem("language");
    
    // Execute the callback
    callback();
    
    // Restore language preference
    if (languagePreference) {
      localStorage.setItem("language", languagePreference);
    }
  } else {
    callback();
  }
}

export function useVerification() {
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const clearVerificationSession = useCallback(() => {
    // Save language preference before clearing session
    const languagePreference = localStorage.getItem("language");

    setIsVerified(false);
    setIsVerifying(false);
    setError(null);
    
    // Clear cookies directly without making an API call
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName && cookieName !== "language") {
        document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${window.location.hostname}`;
        document.cookie = `${cookieName}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
      }
    }
    
    // Restore language preference after clearing session
    if (languagePreference) {
      localStorage.setItem("language", languagePreference);
    }
  }, []);

  const checkVerificationStatus = useCallback(async () => {
    setError(null);
    try {
      // Save language preference before verification check
      const languagePreference = localStorage.getItem("language") || sessionStorage.getItem("language");
      
      // Also set it as a cookie for server-side access
      if (languagePreference) {
        document.cookie = `language=${languagePreference}; Path=/; Max-Age=86400; SameSite=Lax`;
      }
      
      // Add a retry mechanism for session check
      let retries = 3;
      let response;
      
      while (retries > 0) {
        try {
          response = await fetch("/api/auth/session", {
            method: "GET",
            credentials: "include",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              "Pragma": "no-cache",
              "Expires": "0",
              "X-Language-Preference": languagePreference || "en"
            },
          });
          
          // If successful, break out of the retry loop
          if (response.ok) {
            break;
          }
          
          // If unauthorized, no need to retry
          if (response.status === 401) {
            break;
          }
          
          // Otherwise, wait and retry
          await new Promise(resolve => setTimeout(resolve, 500));
          retries--;
        } catch (err) {
          console.error("Error checking session:", err);
          retries--;
          if (retries === 0) {
            throw err;
          }
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // Restore language preference after session check
      if (languagePreference) {
        localStorage.setItem("language", languagePreference);
        sessionStorage.setItem("language", languagePreference);
        document.cookie = `language=${languagePreference}; Path=/; Max-Age=86400; SameSite=Lax`;
      }
      
      // If we still don't have a response or it failed after retries
      if (!response || !response.ok) {
        if (response && response.status === 401) {
          preserveLanguagePreference(() => {
            clearVerificationSession();
            router.push("/sign-in");
          });
          return;
        }
        throw new Error("Failed to check verification status");
      }

      const data = await response.json();
      
      setIsVerified(data.isVerified);

      // Handle registration and authentication states
      if (!data.isAuthenticated) {
        preserveLanguagePreference(() => {
          clearVerificationSession();
          router.push("/sign-in");
        });
        return;
      }

      if (!data.isRegistered) {
        router.push("/register");
        return;
      }
    } catch (error) {
      console.error("Error in checkVerificationStatus:", error);
      if (error instanceof DOMException) {
        preserveLanguagePreference(() => {
          clearVerificationSession();
          router.push("/sign-in");
        });
        return;
      }
      setError(
        error instanceof Error
          ? error.message
          : "Failed to check verification status",
      );
    } finally {
      setIsLoading(false);
      setHasCheckedInitial(true);
    }
  }, [router, clearVerificationSession]);

  // Initial check on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      checkVerificationStatus();
    }
  }, [checkVerificationStatus]);

  const handleVerify = async () => {
    setError(null);
    if (!MiniKit.isInstalled()) {
      setError(t('verification.worldAppNotInstalled'));
      window.open("https://worldcoin.org/download-app", "_blank");
      return false;
    }

    // Save language preference before verification
    const languagePreference = localStorage.getItem("language");
    if (languagePreference) {
      sessionStorage.setItem("language", languagePreference);
      document.cookie = `language=${languagePreference}; Path=/; Max-Age=86400; SameSite=Lax`;
    }

    setIsVerifying(true);
    try {
      const verifyPayload: VerifyCommandInput = {
        action: "verify-user",
        verification_level: VerificationLevel.Orb,
      };

      // Implement a retry mechanism for verification
      let finalPayload;
      let retryCount = 0;
      const maxRetries = 2;
      
      while (retryCount <= maxRetries) {
        try {
          const result = await MiniKit.commandsAsync
            .verify(verifyPayload)
            .catch((error) => {
              console.error(`Verification command attempt ${retryCount + 1} failed:`, error);
              
              // Handle specific error types
              if (error instanceof DOMException) {
                throw new Error("Verification cancelled");
              }
              
              // Handle other error types
              if (typeof error === 'object' && error !== null) {
                const errorObj = error as Record<string, unknown>;
                if (errorObj.message === "Signature verification failed" || 
                    (typeof errorObj.message === 'string' && errorObj.message.includes("Signature"))) {
                  throw new Error("Signature verification failed. Please try again.");
                }
                if (typeof errorObj.message === 'string' && errorObj.message.includes("Load failed")) {
                  throw new Error("Connection error. Please check your internet connection and try again.");
                }
              }
              
              throw error;
            });
          
          finalPayload = result.finalPayload;
          break; // If successful, exit the loop
        } catch (verifyError) {
          if (retryCount === maxRetries || 
              (verifyError instanceof Error && verifyError.message === "Verification cancelled")) {
            // If we've exhausted retries or the user cancelled, rethrow the error
            throw verifyError;
          }
          
          console.warn(`Retrying verification (attempt ${retryCount + 1}/${maxRetries})...`);
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          retryCount++;
        }
      }

      if (!finalPayload || finalPayload.status === "error") {
        console.error("World ID verification failed:", finalPayload);
        setError(t('verification.verificationFailed'));
        return false;
      }

      // Restore language preference after verification
      if (languagePreference) {
        localStorage.setItem("language", languagePreference);
        sessionStorage.setItem("language", languagePreference);
      }

      const verifyResponse = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "X-Language-Preference": languagePreference || "en"
        },
        credentials: "include",
        body: JSON.stringify({
          payload: finalPayload as ISuccessResult,
          action: "verify-user",
        }),
      });

      const verifyResponseJson = await verifyResponse.json();

      if (verifyResponse.ok) {
        setIsVerified(true);
        setError(null);
        await checkVerificationStatus();
        return true;
      }

      if (verifyResponse.status === 401) {
        clearVerificationSession();
        router.push("/sign-in");
      }

      setError(verifyResponseJson.error || t('verification.verificationFailed'));
      return false;
    } catch (error) {
      console.error("Verification error:", error);
      
      // Always restore language preference on error
      const languagePreferenceAfterError = localStorage.getItem("language") || sessionStorage.getItem("language") || "en";
      if (languagePreferenceAfterError) {
        localStorage.setItem("language", languagePreferenceAfterError);
        sessionStorage.setItem("language", languagePreferenceAfterError);
        document.cookie = `language=${languagePreferenceAfterError}; Path=/; Max-Age=86400; SameSite=Lax`;
      }
      
      if (
        error instanceof Error &&
        error.message === "Verification cancelled"
      ) {
        setError(t('verification.verificationCancelled'));
      } else if (error instanceof Error) {
        if (error.message.includes("Signature verification failed")) {
          setError(t('verification.signatureVerificationFailed'));
        } else if (error.message.includes("Load failed")) {
          setError(t('verification.connectionError'));
        } else {
          setError(error.message || t('verification.verificationFailed'));
        }
      } else if (typeof error === "string") {
        setError(error);
      } else if (error && typeof error === "object") {
        if ("message" in error && typeof error.message === "string") {
          setError(error.message as string);
        } else if ("error" in error && typeof error.error === "object" && error.error && "message" in error.error) {
          // Use a proper type definition for the error object
          type ErrorWithNestedMessage = {
            error: {
              message: string;
              [key: string]: unknown;
            };
            [key: string]: unknown;
          };
          setError(String((error as ErrorWithNestedMessage).error.message));
        } else {
          setError(t('verification.verificationFailed'));
        }
      } else {
        setError(t('verification.verificationFailed'));
      }
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerified,
    isVerifying,
    isLoading,
    error,
    hasCheckedInitial,
    handleVerify,
    checkVerificationStatus,
    refreshVerification: checkVerificationStatus,
  };
}
