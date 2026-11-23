import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Motion values prevent React state updates on every mousemove frame
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  // 1. Ambient glow springs
  const glowX = useSpring(cursorX, { damping: 35, stiffness: 180, mass: 0.7 });
  const glowY = useSpring(cursorY, { damping: 35, stiffness: 180, mass: 0.7 });

  // 2. Trailing glass ring springs
  const ringX = useSpring(cursorX, { damping: 26, stiffness: 360, mass: 0.35 });
  const ringY = useSpring(cursorY, { damping: 26, stiffness: 360, mass: 0.35 });

  // 3. Center dot springs
  const dotX = useSpring(cursorX, { damping: 45, stiffness: 650, mass: 0.15 });
  const dotY = useSpring(cursorY, { damping: 45, stiffness: 650, mass: 0.15 });

  useEffect(() => {
    const isTouchDevice =
      window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    if (isTouchDevice) {
      setIsTouch(true);
      return;
    }

    let visibleFlag = false;

    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!visibleFlag) {
        visibleFlag = true;
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      visibleFlag = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      visibleFlag = true;
      setIsVisible(true);
    };

    const handleInteractiveOver = (e) => {
      const target = e.target;
      if (!target || typeof target.closest !== 'function') return;
      const nextHovered = Boolean(
        target.tagName === 'BUTTON' ||
          target.tagName === 'A' ||
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('.interactive-hover') ||
          target.closest('.glass-card-hover')
      );
      setIsHovered((prev) => (prev !== nextHovered ? nextHovered : prev));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleInteractiveOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleInteractiveOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  if (isTouch || !isVisible) return null;

  return (
    <>
      {/* 1. Large Ambient Mouse-Following Glow (Hardware-composited radial gradient without expensive CSS blur filter) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[1] rounded-full will-change-transform"
        style={{
          x: glowX,
          y: glowY,
          width: 300,
          height: 300,
          marginLeft: -150,
          marginTop: -150,
          background:
            'radial-gradient(circle, rgba(143, 169, 254, 0.22) 0%, rgba(119, 101, 232, 0.12) 38%, rgba(196, 181, 253, 0.04) 62%, transparent 75%)'
        }}
      />

      {/* 2. Outer soft trailing glass ring aura */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full will-change-transform transition-[width,height,margin,background-color,border-color] duration-150"
        style={{
          x: ringX,
          y: ringY,
          width: isHovered ? 56 : 40,
          height: isHovered ? 56 : 40,
          marginLeft: isHovered ? -28 : -20,
          marginTop: isHovered ? -28 : -20,
          backgroundColor: isHovered
            ? 'rgba(119, 101, 232, 0.15)'
            : 'rgba(143, 169, 254, 0.20)',
          border: isHovered
            ? '1.5px solid rgba(119, 101, 232, 0.55)'
            : '1px solid rgba(143, 169, 254, 0.35)'
        }}
      />

      {/* 3. Center glowing violet dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full will-change-transform transition-[width,height,margin,background-color] duration-150"
        style={{
          x: dotX,
          y: dotY,
          width: isHovered ? 8 : 6,
          height: isHovered ? 8 : 6,
          marginLeft: isHovered ? -4 : -3,
          marginTop: isHovered ? -4 : -3,
          backgroundColor: isHovered ? '#6451D8' : '#7765E8'
        }}
      />
    </>
  );
}
