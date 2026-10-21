import React from 'react';

export const SaasCard = ({
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

export const ClayCard = SaasCard;
