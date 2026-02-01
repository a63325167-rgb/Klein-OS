import { useEffect, useState } from 'react';

/**
 * Custom hook for scroll-triggered animations
 * @param {string} elementId - ID of the element to observe
 * @param {number} threshold - Intersection threshold (0-1)
 */
export const useScrollAnimation = (elementId, threshold = 0.2) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold }
    );

    const element = document.getElementById(elementId);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [elementId, threshold]);

  return isVisible;
};

/**
 * Animation class names for fade-in effects
 */
export const fadeInUp = (isVisible, delay = 0) => {
  return `transition-all duration-700 ${
    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
  }`;
};

/**
 * Animation class names for fade-in with scale
 */
export const fadeInScale = (isVisible, delay = 0) => {
  return `transition-all duration-500 ${
    isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
  }`;
};

/**
 * Stagger animation utility
 * @param {number} index - Index of the element in the list
 * @param {number} baseDelay - Base delay in milliseconds
 */
export const staggerDelay = (index, baseDelay = 100) => {
  return {
    transitionDelay: `${index * baseDelay}ms`
  };
};

/**
 * Custom easing for smooth animations
 */
export const customEasing = 'cubic-bezier(0.16, 1, 0.3, 1)';

/**
 * Animation variants for different elements
 */
export const animationVariants = {
  hero: {
    duration: 700,
    easing: customEasing,
    delay: 0
  },
  valueProps: {
    duration: 500,
    easing: customEasing,
    staggerDelay: 150
  },
  charts: {
    duration: 1500,
    easing: 'ease-out',
    delay: 200
  },
  cta: {
    hover: {
      scale: 1.02,
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }
  }
};

export default {
  useScrollAnimation,
  fadeInUp,
  fadeInScale,
  staggerDelay,
  animationVariants
};
