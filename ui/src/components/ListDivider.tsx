import React from 'react';

interface IListDividerProps {
  height?: string;
  children?: React.ReactNode;
}

export const ListDivider: React.FC<IListDividerProps> = ({children, height='16px'}) => (
  <div style={{height: height}}>
    {children}
  </div>
)
