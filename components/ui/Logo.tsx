import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 100, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Внешний круг */}
      <circle cx="50" cy="50" r="48" fill="#0066cc" stroke="#0099ff" strokeWidth="2"/>
      
      {/* Внутренний круг */}
      <circle cx="50" cy="50" r="35" fill="none" stroke="#0099ff" strokeWidth="2"/>
      
      {/* Капля воды */}
      <path d="M50 25 Q45 35 50 45 Q55 35 50 25 Z" fill="#00ccff"/>
      
      {/* Волна */}
      <path d="M35 60 Q50 55 65 60" stroke="#0099ff" strokeWidth="2" fill="none"/>
      
      {/* Солнечные лучи */}
      <g stroke="#ffffff" strokeWidth="1.5">
        <line x1="50" y1="15" x2="50" y2="5"/>
        <line x1="65" y1="20" x2="72" y2="13"/>
        <line x1="80" y1="35" x2="87" y2="35"/>
        <line x1="65" y1="50" x2="72" y2="57"/>
        <line x1="50" y1="55" x2="50" y2="65"/>
        <line x1="35" y1="50" x2="28" y2="57"/>
        <line x1="20" y1="35" x2="13" y2="35"/>
        <line x1="35" y1="20" x2="28" y2="13"/>
      </g>
      
      {/* Текст МП ЧУЙ */}
      <text x="50" y="25" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold">МП ЧУЙ</text>
      
      {/* Текст ВОДОКАНАЛ */}
      <text x="50" y="75" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold">ВОДОКАНАЛ</text>
    </svg>
  );
};

export default Logo; 