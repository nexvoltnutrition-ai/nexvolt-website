import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  dark?: boolean;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  onClick,
  dark = false,
  to,
}) => {
  const content = (
    <div
      className={`flex items-center gap-2 cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      {/* Vertical Line */}
      <div
        className={`w-[3px] h-[44px] md:h-[54px] lg:h-[60px] rounded-sm ${
          dark ? 'bg-white' : 'bg-[#111111]'
        }`}
      />

      {/* Logo Text */}
      <div className="flex flex-col items-center justify-center">
        <span
          className={`font-black text-[28px] md:text-[34px] lg:text-[38px] leading-none uppercase tracking-[0.08em] ${
            dark ? 'text-white' : 'text-[#111111]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          NEXVOLT
        </span>

       <span
  className={`mt-[2px] text-[10px] md:text-[11px] lg:text-[11px] font-medium uppercase tracking-[0.16em] whitespace-nowrap ${
    dark ? 'text-gray-300' : 'text-[#666666]'
  }`}
  style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '0.45em' }}
>
  PEAK PERFORMANCE
</span>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
};