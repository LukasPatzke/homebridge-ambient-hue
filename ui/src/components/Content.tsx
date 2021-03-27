import React from 'react'

interface IContentProps {
  modalRef?: HTMLElement | null;
}
export const Content: React.FC<IContentProps & React.HTMLProps<HTMLDivElement>> = (props) => {
  return (
    <div {...props} className={props.className?`${props.className} lp-content`:'lp-content'}>
      {React.Children.map(props.children, (child)=>{
        if (React.isValidElement(child) && props.modalRef) {
          return React.cloneElement(child, { touchEvents: {
            onTouchStart: props.modalRef.ontouchstart,
            onTouchMove: props.modalRef.ontouchmove,
            onTouchEnd: props.modalRef.ontouchend,
            onTouchCancel: props.modalRef.ontouchcancel,
          }})
        } else {
          return child
        }
      })}
    </div>
  )
}