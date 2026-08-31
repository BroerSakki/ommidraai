// components/icons/ArrowBoiIcon.tsx
import { SVGProps } from 'react';

interface LocationIconProps extends SVGProps<SVGSVGElement> {
  rotation?: number;
  color?: string;
}

export default function LocationIcon({ 
  rotation = 0, 
  color, 
  style, 
  className = "w-8 h-8", 
  ...props 
}: LocationIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="currentColor" className={className} style={{transform: `rotate(${rotation}deg)`, color: color, display: 'inline-block', ...style }} stroke="#ffffff" strokeWidth="0" {...props}>
        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z"/>
        <circle cx="12" cy="9" r="3" fill="#ffffff" stroke="none"/>
    </svg>
  );
}
