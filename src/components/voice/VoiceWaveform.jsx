import React, { useEffect, useRef } from 'react';

const VoiceWaveform = ({ analyser, isListening }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high resolution for retina displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      if (!isListening || !analyser) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        return;
      }

      animationRef.current = requestAnimationFrame(draw);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);

      const barWidth = (rect.width / 32) - 1.5;
      let x = 0;

      // Draw 32 bars symmetrically from the center
      for (let i = 0; i < 32; i++) {
        // Read amplitude in the voice frequency range
        const dataIdx = Math.floor(i * (bufferLength / 64));
        const percent = dataArray[dataIdx] / 255;
        const barHeight = Math.max(3, percent * rect.height * 0.95);

        // Styling (ClinIQ+ signature purple tone)
        ctx.fillStyle = 'rgba(124, 58, 237, 0.85)';
        
        // Center the bars vertically
        const y = (rect.height - barHeight) / 2;
        
        // Round rect bars
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();

        x += barWidth + 1.5;
      }
    };

    if (isListening && analyser) {
      draw();
    } else {
      ctx.clearRect(0, 0, rect.width, rect.height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [analyser, isListening]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default VoiceWaveform;
