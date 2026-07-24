import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  dark?: boolean;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  onClick,
  dark = false,
  to,
}) => {
  const content = (
    <div
      className={`flex items-center gap-1.5 md:gap-2 cursor-pointer select-none ${className}`}
      onClick={onClick}
    >
      {/* Vertical Line */}
      <div
        className={`w-[3px] h-[38px] sm:h-[42px] md:h-[54px] lg:h-[60px] rounded-full ${
          dark ? "bg-white" : "bg-[#111111]"
        }`}
      />

      {/* Logo Text */}
      <div className="flex flex-col justify-center leading-none">
        {/* NEXVOLT */}
        <span
          className={`font-black uppercase tracking-[0.06em] text-[24px] sm:text-[27px] md:text-[34px] lg:text-[38px] ${
            dark ? "text-white" : "text-[#111111]"
          }`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          NEXVOLT
        </span>

        {/* Subtitle */}
        <span
          className={`mt-[2px] uppercase whitespace-nowrap font-medium tracking-[0.28em] text-[7px] sm:text-[8px] md:text-[10px] lg:text-[11px] ${
            dark ? "text-gray-300" : "text-[#666666]"
          }`}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          PEAK PERFORMANCE
        </span>
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};