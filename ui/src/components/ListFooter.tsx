import React from 'react';

interface IListFooterProps {
  inset?: boolean;
}

export const ListFooter: React.FC<IListFooterProps> = ({children, inset=false}) => {
  var className: string = 'lp-list-footer';
  if (inset) {
    className += ' inset';
  }
  return (
    <div className={className}>{children}</div>
  )
}