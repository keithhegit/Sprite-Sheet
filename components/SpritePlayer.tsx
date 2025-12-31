import React, { useRef, useEffect } from 'react';

interface SpritePlayerProps {
  imageUrl: string;
  fps: number;
  rows?: number;
  cols?: number;
  isPlaying: boolean;
  className?: string;
  transparentBg: boolean;
  activeFrames?: boolean[]; // New prop to control which frames are shown
  width?: number;
  height?: number;
}

const SpritePlayer: React.FC<SpritePlayerProps> = ({
  imageUrl,
  fps,
  rows = 4,
  cols = 4,
  isPlaying,
  className,
  transparentBg,
  activeFrames,
  width = 300,
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameIndexRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const requestRef = useRef<number>(0);

  // Helper to find the next active frame index
  const getNextActiveFrame = (current: number, total: number, activeList?: boolean[]) => {
    if (!activeList) return (current + 1) % total;

    let next = (current + 1) % total;
    let attempts = 0;

    // Loop until we find an active frame or we've checked all frames
    while (!activeList[next] && attempts < total) {
      next = (next + 1) % total;
      attempts++;
    }

    // If all frames are disabled, return current (or 0)
    if (attempts >= total) return current;

    return next;
  };

  useEffect(() => {
    const img = new Image();
    img.src = imageUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      // Reset frame index when image changes
      frameIndexRef.current = 0;
      // Make sure we start on an active frame
      if (activeFrames && !activeFrames[0]) {
        frameIndexRef.current = getNextActiveFrame(-1, rows * cols, activeFrames);
      }
      drawFrame();
    };
  }, [imageUrl]);

  const drawFrame = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fixed canvas size for display
    const totalFrames = rows * cols;
    const frameWidth = img.width / cols;
    const frameHeight = img.height / rows;

    // Ensure current frame is valid (in case activeFrames changed)
    if (activeFrames && !activeFrames[frameIndexRef.current]) {
      // Try to find a valid frame immediately if current one got disabled
      frameIndexRef.current = getNextActiveFrame(frameIndexRef.current, totalFrames, activeFrames);
    }

    // Calculate current row/col
    const currentFrame = frameIndexRef.current;
    const colIndex = currentFrame % cols;
    const rowIndex = Math.floor(currentFrame / cols);

    const sourceX = colIndex * frameWidth;
    const sourceY = rowIndex * frameHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background if not transparent
    if (!transparentBg) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw frame (scale to canvas size)
    ctx.imageSmoothingEnabled = false; // Pixel art style

    // Calculate aspect ratio fit
    const scale = Math.min(canvas.width / frameWidth, canvas.height / frameHeight);
    const drawW = frameWidth * scale;
    const drawH = frameHeight * scale;
    const offsetX = (canvas.width - drawW) / 2;
    const offsetY = (canvas.height - drawH) / 2;

    ctx.drawImage(
      img,
      sourceX, sourceY, frameWidth, frameHeight, // Source
      offsetX, offsetY, drawW, drawH // Destination
    );
  };

  const animate = (time: number) => {
    if (!isPlaying) return;

    const timeSinceLastFrame = time - lastFrameTimeRef.current;
    const frameInterval = 1000 / fps;

    if (timeSinceLastFrame > frameInterval) {
      const totalFrames = rows * cols;
      frameIndexRef.current = getNextActiveFrame(frameIndexRef.current, totalFrames, activeFrames);
      lastFrameTimeRef.current = time;
      drawFrame();
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, fps, rows, cols, activeFrames]); // Re-run if activeFrames changes

  // Redraw when background toggle or activeFrames changes (for static view)
  useEffect(() => {
    drawFrame();
  }, [transparentBg, activeFrames]);

  return (
    <canvas ref={canvasRef} width={width} height={height} className={className} />
  );
};

export default SpritePlayer;