import React from 'react';

/**
 * Clean SaaS card container (aliased to ClayCard for compatibility)
 */
export const ClayCard = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/80 rounded-xl shadow-sm p-5 transition-all duration-150 ${
        hoverable ? 'hover:border-slate-300 hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
