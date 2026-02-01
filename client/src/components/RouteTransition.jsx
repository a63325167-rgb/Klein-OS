import React from 'react';
import { useLocation } from 'react-router-dom';

const RouteTransition = ({ children }) => {
  const location = useLocation();

  return (
    <div
      key={location.pathname}
      className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300"
      style={{
        animation: 'fadeInUp 0.3s ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default RouteTransition;


