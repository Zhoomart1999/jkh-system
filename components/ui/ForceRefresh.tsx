import React, { useEffect } from 'react';

interface ForceRefreshProps {
  onRefresh: () => void;
  delay?: number;
}

const ForceRefresh: React.FC<ForceRefreshProps> = ({ onRefresh, delay = 100 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRefresh();
    }, delay);
    
    return () => clearTimeout(timer);
  }, [onRefresh, delay]);

  return null;
};

export default ForceRefresh; 