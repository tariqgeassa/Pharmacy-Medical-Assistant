import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Scan, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { scanDrugImage } from '@/services/drugService';
import { DrugInfo } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

interface ScannerProps {
  onResult: (result: DrugInfo) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onResult, onClose }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsScanning(true);
        setError(null);
        try {
          const result = await scanDrugImage(imageSrc);
          if (result) {
            onResult(result);
          } else {
            setError("Could not identify medicine. Please try again with a clearer image.");
          }
        } catch (err) {
          setError("Scanning failed. Please check your connection.");
        } finally {
          setIsScanning(false);
        }
      }
    }
  }, [webcamRef, onResult]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <Card className="relative w-full max-w-md overflow-hidden border-none bg-background shadow-2xl">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 z-10 rounded-full bg-black/20 text-white hover:bg-black/40"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>

        <CardContent className="p-0">
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="h-full w-full object-cover"
              videoConstraints={{
                facingMode: "environment"
              }}
              mirrored={false}
              imageSmoothing={true}
              disablePictureInPicture={true}
              forceScreenshotSourceSize={true}
              onUserMedia={() => {}}
              onUserMediaError={() => {}}
              screenshotQuality={0.92}
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-12 border-2 border-primary/50 rounded-lg">
                <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-sm" />
                <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-sm" />
                <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-sm" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-sm" />
                
                {isScanning && (
                  <motion.div 
                    initial={{ top: "0%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                  />
                )}
              </div>
            </div>

            {error && (
              <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-destructive/90 p-3 text-center text-xs text-white backdrop-blur-sm">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Scan Medicine</h3>
              <p className="text-sm text-muted-foreground">Position the medicine package within the frame</p>
            </div>

            <Button 
              size="lg" 
              className="h-16 w-16 rounded-full shadow-lg" 
              onClick={capture}
              disabled={isScanning}
            >
              {isScanning ? (
                <RefreshCw className="h-8 w-8 animate-spin" />
              ) : (
                <Camera className="h-8 w-8" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
