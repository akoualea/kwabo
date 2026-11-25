import React from 'react';

interface BrandLogoProps {
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
  onClick?: () => void;
  className?: string;
}

const SIZE_MAP: Record<NonNullable<BrandLogoProps['size']>, { imgClass: string; pillClass: string; subClass: string }> = {
  sm: {
    imgClass: 'h-7 sm:h-8 w-auto max-w-[114px] sm:max-w-[140px]',
    pillClass: 'rounded-lg px-2 py-1',
    subClass: 'text-[10px]',
  },
  md: {
    imgClass: 'h-10 w-auto max-w-[175px]',
    pillClass: 'rounded-xl px-2.5 py-1.5',
    subClass: 'text-[11px]',
  },
  lg: {
    imgClass: 'h-12 w-auto max-w-[210px]',
    pillClass: 'rounded-xl px-3 py-1.5',
    subClass: 'text-xs',
  },
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  subtitle,
  size = 'md',
  light = false,
  onClick,
  className = '',
}) => {
  const cfg = SIZE_MAP[size];
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`group inline-flex items-center gap-2.5 text-left select-none focus:outline-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <span
        className={`inline-flex shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-[1.02] ${
          light ? `bg-white shadow-sm ${cfg.pillClass}` : ''
        }`}
      >
        <img
          src="/assets/benilink-logo.png"
          alt="BeniLink"
          className={`${cfg.imgClass} object-contain`}
        />
      </span>
      {subtitle ? (
        <span
          className={`hidden border-l pl-2.5 font-sans font-medium tracking-wide sm:inline-block ${cfg.subClass} ${
            light ? 'border-white/25 text-white/85' : 'border-[#d0e3f5] text-[#505f75]'
          }`}
        >
          {subtitle}
        </span>
      ) : null}
    </Tag>
  );
};
