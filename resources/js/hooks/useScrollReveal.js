import { useEffect, useRef, useState } from 'react';

const useScrollReveal = ({ threshold = 0.12, rootMargin = '0px 0px -40px 0px' } = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || prefersReducedMotion || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold, rootMargin });

    observer.observe(element);
    return () => observer.disconnect();
  }, [prefersReducedMotion, rootMargin, threshold]);

  return { elementRef, isVisible: isVisible || prefersReducedMotion, prefersReducedMotion };
};

export default useScrollReveal;
