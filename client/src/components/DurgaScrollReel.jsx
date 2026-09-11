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
        return track.scrollWidth - window.innerWidth;
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
          height: ${Math.max(250, cardCount * 100)}vh;
          position: relative;
          background: #000;
          width: 100%;
          margin: 0;
          padding: 0;
        }
        .durga-reel-pin {
          height: 100vh;
          width: 100%;
          position: sticky;
          top: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          background: #000;
        }
        .durga-reel-track {
          display: flex;
          gap: 0;
          padding: 0;
          margin: 0;
          height: 100vh;
          width: max-content;
          will-change: transform;
        }
        .durga-reel-card {
          flex: 0 0 auto;
          width: 78vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
          background: #0a0502;
          margin: 0;
          padding: 0;
        }
        .durga-reel-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          dynamic-range: standard;
        }
        .durga-reel-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.65) 0%, rgba(0, 0, 0, 0) 35%);
          pointer-events: none;
        }
        .durga-reel-card-info {
          position: absolute;
          bottom: 32px;
          left: 36px;
          z-index: 2;
          display: flex;
          align-items: baseline;
          gap: 10px;
          pointer-events: none;
        }
        .durga-reel-card-idx {
          font-family: 'Cinzel', 'Playfair Display', serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #D4AF37;
          letter-spacing: 2px;
        }
        .durga-reel-card-total {
          font-family: 'Hind Siliguri', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.65);
          letter-spacing: 1px;
        }
        @media (max-width: 768px) {
          .durga-reel-card {
            width: 88vw;
          }
          .durga-reel-card-info {
            bottom: 24px;
            left: 20px;
          }
          .durga-reel-card-idx {
            font-size: 1.1rem;
          }
        }
      `}</style>

      <div className="durga-reel-wrap" ref={wrapRef}>
        <div className="durga-reel-pin">
          <div className="durga-reel-track" ref={trackRef}>
            {images.map((imgUrl, idx) => (
              <div className="durga-reel-card" key={idx}>
                <img
                  src={getOptimizedImageUrl(imgUrl)}
                  alt={`Durga Celebration ${idx + 1}`}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="durga-reel-card-overlay" />
                <div className="durga-reel-card-info">
                  <span className="durga-reel-card-idx">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="durga-reel-card-total">
                    / {String(images.length).padStart(2, '0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
