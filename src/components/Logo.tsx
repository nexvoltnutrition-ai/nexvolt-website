import React from "react";
import { Link } from "react-router-dom";

interface LogoProps {
  className?: string;
  onClick?: () => void;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = "",
  onClick,
  to,
}) => {
  const content = (
    <img
      src="/nexvolt-logo.png"
      alt="NEXVOLT"
      onClick={onClick}
      className={`h-12 md:h-14 lg:h-16 w-auto cursor-pointer select-none ${className}`}
      draggable={false}
    />
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