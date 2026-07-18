import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  onClick?: () => void;
  dark?: boolean;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', onClick, dark = false, to }) => {
  const content = (
    <div 
      className={`flex items-stretch gap-1 md:gap-1.5 cursor-pointer select-none ${className}`} 
      onClick={onClick}
    >
      <div className={`w-[3.5px] rounded-sm ${dark ? "bg-white" : "bg-[#111111]"}`} />
      <div className="flex flex-col justify-center py-[1px]">
        <span 
          className={`font-bold text-[22px] md:text-[28px] lg:text-[32px] leading-[0.85] tracking-[0.1em] uppercase -mr-[0.1em] ${dark ? "text-white" : "text-[#111111]"}`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          NEXVOLT
        </span>
        <div 
          className={`flex justify-between w-full text-[6.5px] md:text-[8px] lg:text-[9.5px] font-medium leading-none uppercase mt-[1.5px] ${dark ? "text-gray-300" : "text-[#555555]"}`}
          aria-label="PEAK PERFORMANCE"
        >
          {"PEAK PERFORMANCE".split('').map((char, i) => (
            <span key={i} aria-hidden="true">{char === ' ' ? '\u00A0' : char}</span>
          ))}
        </div>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block">{content}</Link>;
  }

  return content;
};
