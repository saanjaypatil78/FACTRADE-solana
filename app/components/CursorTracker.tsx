'use client';

import { useEffect } from 'react';

/**
 * CursorTracker component that tracks mouse position and updates CSS variables
 * for cursor-oriented animations throughout the application
 */
export function CursorTracker() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      // Normalize cursor position to 0-1 range
      const x = clientX / innerWidth;
      const y = clientY / innerHeight;
      
      // Update CSS variables for cursor-based animations
      document.documentElement.style.setProperty('--cursor-x', `${x}`);
      document.documentElement.style.setProperty('--cursor-y', `${y}`);
    };

    // Track cursor position on every element with cursor tracking classes
    const handleElementMouseMove = (e: MouseEvent) => {
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      
      target.style.setProperty('--cursor-x', `${x}`);
      target.style.setProperty('--cursor-y', `${y}`);
    };

    // Add global mouse move listener
    window.addEventListener('mousemove', handleMouseMove);
    
    // Add element-specific listeners for cursor-tilt elements
    const tiltElements = document.querySelectorAll('.cursor-tilt, .cursor-glow, .spotlight-effect');
    tiltElements.forEach((element) => {
      element.addEventListener('mousemove', handleElementMouseMove as EventListener);
    });

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      tiltElements.forEach((element) => {
        element.removeEventListener('mousemove', handleElementMouseMove as EventListener);
      });
    };
  }, []);

  return null; // This component doesn't render anything
}
