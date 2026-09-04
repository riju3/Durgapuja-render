import React, { useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '../utils/imageUtils';

export default function DurgaScrollReel({ images }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const cleanupRef = useRef(null);

  useEffect(() => {
    if (!images || images.length === 0) return;

    // Dynamically load GSAP + ScrollTrigger + Lenis only once
    function loadScript(src) {
      return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    let ctx;

    Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js'),
    ]).then(() => {
      const { gsap, ScrollTrigger, Lenis } = window;
      if (!gsap || !ScrollTrigger || !trackRef.current || !wrapRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const track = trackRef.current;

      function getScrollDistance() {
        return track.scrollWidth - window.innerWidth + window.innerWidth * 0.06;
      }

      ctx = gsap.context(() => {
        gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
          scrollTrigger: {
            trigger: wrapRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });

      // Lenis smooth scroll
      if (Lenis) {
        const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time) => { lenis.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
        cleanupRef.current = () => {
          lenis.destroy();
          ctx && ctx.revert();
        };
      } else {
        cleanupRef.current = () => { ctx && ctx.revert(); };
      }
    });

    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, [images]);

  const cardCount = images.length;

  return (
    <>
      <style>{`
        .durga-reel-wrap {
          height: ${Math.max(300, cardCount * 100)}vh;
          position: relative;
          background: #1a0a00;
        }
        .durga-reel-pin {
          height: 100vh;
          position: sticky;
          top: 0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .durga-reel-heading {
          text-align: center;
          font-family: 'Playfair Display', serif;
          font-size: clamp(1.2rem, 2.5vw, 1.7rem);
          color: #F0D060;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 28px;
          flex-shrink: 0;
          padding-top: 24px;
        }
        .durga-reel-heading span {
          border-bottom: 2px solid #C0392B;
          padding-bottom: 4px;
        }
        .durga-reel-track {
          display: flex;
          gap: 5vw;
          padding-left: 8vw;
          padding-right: 8vw;
          will-change: transform;
          align-items: center;
        }
        .durga-reel-card {
          flex: 0 0 auto;
          width: min(480px, 72vw);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.55);
          border: 2px solid rgba(212,175,55,0.35);
          transition: border-color 0.4s;
          position: relative;
          aspect-ratio: 3/4;
          background: #0f0804;
        }
        .durga-reel-card:hover {
          border-color: #D4AF37;
        }
        .durga-reel-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          dynamic-range: standard;
        }
        .durga-reel-card-num {
          position: absolute;
          bottom: 16px;
          right: 18px;
          font-family: 'Playfair Display', serif;
          font-size: 0.75rem;
          color: rgba(240, 208, 96, 0.7);
          letter-spacing: 2px;
          text-transform: uppercase;
        }
        .durga-reel-progress {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .durga-reel-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(212,175,55,0.35);
          transition: background 0.3s;
        }
        @media(max-width: 640px) {
          .durga-reel-card {
            width: min(300px, 82vw);
            aspect-ratio: 2/3;
          }
          .durga-reel-heading {
            font-size: 0.95rem;
            letter-spacing: 2px;
          }
        }
      `}</style>

      <div className="durga-reel-wrap" ref={wrapRef}>
        <div className="durga-reel-pin">
          <h2 className="durga-reel-heading">
            <span>মা দুর্গার আলোকচিত্র সংকলন</span>
          </h2>

          <div className="durga-reel-track" ref={trackRef}>
            {images.map((imgUrl, idx) => (
              <div className="durga-reel-card" key={idx}>
                <img
                  src={getOptimizedImageUrl(imgUrl)}
                  alt={`Maa Durga ${idx + 1}`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="durga-reel-card-num">
                  {String(idx + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="durga-reel-progress">
            {images.map((_, i) => (
              <div className="durga-reel-dot" key={i} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
