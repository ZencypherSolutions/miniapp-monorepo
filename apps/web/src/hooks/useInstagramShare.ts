import { RefObject } from "react";

export function useInstagramShare(canvasRef: RefObject<HTMLCanvasElement>) {
  const handleInstagramShare = async () => {
    console.log('Starting Instagram share process');
    
    if (!canvasRef.current) {
      console.error('Canvas reference is not available');
      alert('Unable to share: Canvas is not available. Please try again.');
      return;
    }

    try {
      console.log('Canvas is available, preparing to convert to image');
      
      // Convert canvas to Blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          reject(new Error("Canvas reference lost during conversion"));
          return;
        }
        
        console.log(`Converting canvas (${canvas.width}x${canvas.height}) to blob`);
        canvas.toBlob((b) => {
          if (b) {
            console.log(`Blob created successfully: ${b.size} bytes`);
            resolve(b);
          } else {
            console.error('Canvas toBlob returned null');
            reject(new Error("Canvas conversion failed"));
          }
        }, "image/png");
      });
      
      const file = new File([blob], "results.png", { type: "image/png" });
      console.log(`File created: ${file.name}, ${file.size} bytes`);

      // Use native share if available
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        console.log('Native sharing is available, attempting to share');
        try {
          await navigator.share({
            files: [file],
            title: "My Political Compass Results",
            text: "Check out my political compass results!",
          });
          console.log('Native sharing completed successfully');
          return;
        } catch (error) {
          console.error("Error with native sharing:", error);
        }
      } else {
        console.log('Native sharing not available, falling back to alternative methods');
      }

      // Fallback: share via Instagram Stories URL scheme
      console.log('Preparing Instagram Stories URL scheme');
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error("Canvas reference lost during URL conversion");
      }
      
      const dataUrl = canvas.toDataURL("image/png");
      console.log(`DataURL created (length: ${dataUrl.length})`);
      
      const encodedImage = encodeURIComponent(dataUrl);
      const instagramUrl = `instagram-stories://share?backgroundImage=${encodedImage}&backgroundTopColor=%23000000&backgroundBottomColor=%23000000`;
      console.log('Opening Instagram URL');
      window.location.href = instagramUrl;

      // Alert if Instagram doesn't open automatically
      setTimeout(() => {
        console.log('Showing fallback alert');
        alert(
          "If Instagram did not open automatically, please open Instagram and use the image from your camera roll to share to your story.",
        );
      }, 2500);

      // Final fallback: download the image
      console.log('Providing download fallback');
      const link = document.createElement("a");
      link.download = "results.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Image download triggered');
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      alert(
        "Unable to share directly to Instagram. Please try again or manually save and share the image.",
      );
    }
  };

  return { handleInstagramShare };
}