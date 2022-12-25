import React from 'react'

export const Content: React.FC<React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div {...props} className={props.className?`${props.className} lp-content`:'lp-content'}>
      {props.children}
    </div>
  )
}