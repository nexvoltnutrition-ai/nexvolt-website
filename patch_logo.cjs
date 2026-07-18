const fs = require('fs');
let code = `import React from 'react';
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
      className={\`flex items-stretch gap-1 md:gap-1.5 cursor-pointer select-none \${className}\`} 
      onClick={onClick}
    >
      <div className={\`w-[3.5px] rounded-sm \${dark ? "bg-white" : "bg-[#111111]"}\`} />
      <div className="flex flex-col justify-center py-[1px] items-center">
        <span 
          className={\`font-bold text-[22px] md:text-[28px] lg:text-[32px] leading-[0.85] tracking-[0.1em] uppercase pl-[0.1em] \${dark ? "text-white" : "text-[#111111]"}\`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          NEXVOLT
        </span>
        <span 
          className={\`text-[7px] md:text-[9px] lg:text-[10px] font-medium tracking-[0.32em] leading-none uppercase mt-[2px] pl-[0.32em] \${dark ? "text-gray-300" : "text-[#555555]"}\`}
        >
          PEAK PERFORMANCE
        </span>
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block">{content}</Link>;
  }

  return content;
};
`;

fs.writeFileSync('src/components/Logo.tsx', code);
