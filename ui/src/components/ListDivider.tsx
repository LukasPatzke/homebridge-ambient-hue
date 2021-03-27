import React from 'react';

interface IListDividerProps {
  height?: string;
}

export const ListDivider: React.FC<IListDividerProps> = ({children, height='16px'}) => (
  <div style={{height: height}}>
    {children}
  </div>
)
