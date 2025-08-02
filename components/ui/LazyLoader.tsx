import React, { Suspense, lazy, ComponentType } from 'react';
import PageLoader from './PageLoader';

interface LazyLoaderProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
}

const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  component, 
  fallback = <PageLoader /> 
}) => {
  const LazyComponent = lazy(component);
  
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
};

export default LazyLoader; 