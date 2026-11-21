import React from 'react';
import { Box } from '@mui/material';
import useScrollReveal from '../../hooks/useScrollReveal';

const ScrollReveal = ({
  children,
  delay = 0,
  distance = 20,
  scale = 1,
  threshold,
  rootMargin,
  sx,
  ...props
}) => {
  const { elementRef, isVisible, prefersReducedMotion } = useScrollReveal({ threshold, rootMargin });

  return (
    <Box
      ref={elementRef}
      sx={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0) scale(1)' : `translateY(${distance}px) scale(${scale})`,
        transition: prefersReducedMotion
          ? 'none'
          : `opacity 500ms ease ${delay}ms, transform 500ms cubic-bezier(0.2, 0.7, 0.2, 1) ${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export default ScrollReveal;
