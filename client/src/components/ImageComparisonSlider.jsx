import React, { useState, useRef, useEffect } from 'react';

export default function ImageComparisonSlider({
  thenImage,
  thenLabel = 'THEN · 2019',
  nowImage,
  nowLabel = 'NOW · 2026'
}) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let pos = (x / rect.width) * 100;
    if (pos < 0) pos = 0;
    if (pos > 100) pos = 100;
    setSliderPos(pos);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    const handleGlobalMouseMove = (e) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleGlobalTouchMove = (e) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    if (isDragging) {
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('touchend', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
    }
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchend', handleGlobalMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, [isDragging]);

  if (!thenImage || !nowImage) return null;

  return (
    <div style={{ marginTop: '50px', marginBottom: '40px' }}>
      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        style={{
          position: 'relative',
          width: '100%',
          height: 'auto',
          aspectRatio: '16 / 9',
          minHeight: '380px',
          maxHeight: '750px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 10px 35px rgba(0,0,0,0.18)',
          userSelect: 'none',
          cursor: isDragging ? 'ew-resize' : 'pointer',
          background: '#0f0804',
          border: '2px solid #D4AF37'
        }}
      >
        {/* Right Image (NOW / Present Image) */}
        <img
          src={nowImage}
          alt={nowLabel}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none'
          }}
        />

        {/* Left Image (THEN / Past Image - Clipped cleanly via clipPath) */}
        <img
          src={thenImage}
          alt={thenLabel}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            pointerEvents: 'none'
          }}
        />

        {/* Top-Left Pill Badge (THEN Label) */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            padding: '8px 20px',
            borderRadius: '30px',
            border: '1.5px solid rgba(212, 175, 55, 0.7)',
            background: 'rgba(15, 8, 4, 0.75)',
            color: '#F0D060',
            fontSize: '0.82rem',
            fontWeight: '700',
            letterSpacing: '1.5px',
            fontFamily: 'Cinzel, serif',
            backdropFilter: 'blur(6px)',
            zIndex: 10,
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            textTransform: 'uppercase'
          }}
        >
          {thenLabel}
        </div>

        {/* Top-Right Pill Badge (NOW Label) */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px 20px',
            borderRadius: '30px',
            border: '1.5px solid rgba(212, 175, 55, 0.7)',
            background: 'rgba(15, 8, 4, 0.75)',
            color: '#F0D060',
            fontSize: '0.82rem',
            fontWeight: '700',
            letterSpacing: '1.5px',
            fontFamily: 'Cinzel, serif',
            backdropFilter: 'blur(6px)',
            zIndex: 10,
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            textTransform: 'uppercase'
          }}
        >
          {nowLabel}
        </div>

        {/* Divider Line & Center Circular Drag Handle */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: '3px',
            background: '#D4AF37',
            transform: 'translateX(-50%)',
            zIndex: 20,
            boxShadow: '0 0 12px rgba(212, 175, 55, 0.9)',
            pointerEvents: 'none'
          }}
        >
          {/* Circular Handle */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: '2px solid #D4AF37',
              background: 'rgba(15, 8, 4, 0.9)',
              color: '#F0D060',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              boxShadow: '0 0 18px rgba(212, 175, 55, 0.7)',
              cursor: 'ew-resize',
              pointerEvents: 'auto'
            }}
          >
            ↔
          </div>
        </div>
      </div>
    </div>
  );
}
