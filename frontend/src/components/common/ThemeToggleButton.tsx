import React, { useRef } from 'react';
import { flushSync } from 'react-dom';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../utils/theme';

interface ThemeToggleButtonProps {
  className?: string;
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ className = '' }) => {
  const { isDark, setTheme } = useTheme();
  const toggleBtnRef = useRef<HTMLButtonElement | null>(null);

  const getOrigin = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.clientX !== 0 || event.clientY !== 0) {
      return {
        x: event.clientX,
        y: event.clientY,
      };
    }

    const element = toggleBtnRef.current;
    if (!element) {
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    }

    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  const toggleTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    const nextMode = isDark ? 'light' : 'dark';
    const doc = document as Document & {
      startViewTransition?: (callback: () => void) => { ready: Promise<void> };
    };

    if (!doc.startViewTransition) {
      setTheme(nextMode);
      return;
    }

    const { x, y } = getOrigin(event);
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = doc.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextMode);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    }).catch(() => {
      // Ignore transition cancellation errors
    });
  };

  return (
    <button
      ref={toggleBtnRef}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      title={isDark ? 'Passer en thème clair' : 'Passer en thème sombre'}
      className={`theme-toggle-btn inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#d0e3f5] bg-white text-[#006191] shadow-xs transition hover:bg-[#e3efff] hover:border-[#1593d6] ${className}`}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px] text-[#f7c531]" aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px] text-[#006191]" aria-hidden="true" />
      )}
    </button>
  );
};
