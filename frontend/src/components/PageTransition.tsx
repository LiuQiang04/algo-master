import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';

type AnimationType = 'fade' | 'slide' | 'scale';

interface PageTransitionProps {
  children: ReactNode;
  type?: AnimationType;
  duration?: number;
}

export default function PageTransition({
  children,
  type = 'fade',
  duration = 250,
}: PageTransitionProps) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<'enter' | 'exit'>('enter');
  const prevPathname = useRef(location.pathname);

  const onTransitionEnd = useCallback(() => {
    if (stage === 'exit') {
      setDisplayChildren(children);
      setStage('enter');
    }
  }, [stage, children]);

  useEffect(() => {
    if (location.pathname !== prevPathname.current) {
      prevPathname.current = location.pathname;
      setStage('exit');
    }
  }, [location.pathname]);

  // Fallback: if transitionend doesn't fire, force update
  useEffect(() => {
    if (stage === 'exit') {
      const timer = setTimeout(() => {
        setDisplayChildren(children);
        setStage('enter');
      }, duration + 50);
      return () => clearTimeout(timer);
    }
  }, [stage, children, duration]);

  const style: React.CSSProperties = {
    transition: `opacity ${duration}ms ease, transform ${duration}ms ease`,
    opacity: stage === 'enter' ? 1 : 0,
    transform:
      type === 'slide'
        ? stage === 'enter'
          ? 'translateY(0)'
          : 'translateY(12px)'
        : type === 'scale'
          ? stage === 'enter'
            ? 'scale(1)'
            : 'scale(0.97)'
          : undefined,
  };

  return (
    <div style={style} onTransitionEnd={onTransitionEnd}>
      {stage === 'enter' ? children : displayChildren}
    </div>
  );
}
