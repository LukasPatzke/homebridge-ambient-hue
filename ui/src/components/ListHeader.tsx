import React from 'react';

interface IListHeaderProps {
  inset?: boolean;
  children?: React.ReactNode;
}

export const ListHeader: React.FC<IListHeaderProps> = ({children, inset=false}) => {
  var className: string = 'lp-list-header';
  if (inset) {
    className += ' inset';
  }
  return (
    <div className={className}>{children}</div>
  )
}