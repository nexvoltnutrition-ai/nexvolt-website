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
      {/* Left Vertical Bar */}
      <div
        className={`w-[3.5px] self-stretch rounded-sm ${
          dark ? 'bg-white' : 'bg-[#111111]'
        }`}
      />

      {/* Logo Text */}
      <div className="flex flex-col items-center justify-center">
        <span
          className={`font-bold text-[22px] md:text-[28px] lg:text-[32px] leading-none tracking-[0.08em] uppercase ${
            dark ? 'text-white' : 'text-[#111111]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          NEXVOLT
        </span>

        <span
          className={`mt-[3px] text-[6px] md:text-[7.5px] lg:text-[8.5px] font-medium uppercase tracking-[0.22em] whitespace-nowrap ${
            dark ? 'text-gray-300' : 'text-[#666666]'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
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