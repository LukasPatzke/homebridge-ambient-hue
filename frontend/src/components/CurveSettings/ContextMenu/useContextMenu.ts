import { VirtualElement } from '@popperjs/core';
import { Chart } from 'chart.js';
import { RefObject, useState } from 'react';
import { usePopper } from 'react-popper';


export function useContextMenu(chartRef: RefObject<Chart>) {
  const [isOpen, setOpen] = useState(false);
  const [
    referenceElement,
    setReferenceElement,
  ] = useState<VirtualElement | null>(null);
  const [element, setElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [
    arrowElement,
    setArrowElement,
  ] = useState<HTMLDivElement | null>(null);


  const { styles, attributes } = usePopper(referenceElement, element, {
    placement: 'right',
    modifiers: [
      { name: 'preventOverflow', options: { altAxis: true } },
      { name: 'flip' },
      { name: 'offset', options: { offset: [0, 10] } },
      { name: 'arrow', options: { element: arrowElement } },
    ],
  });

  const openContextMenu = (x: number, y: number, width: number, height: number) => {

    if (chartRef.current) {
      const bounding = chartRef.current.canvas.getBoundingClientRect();
      x += bounding.x - (width / 2);
      y += bounding.y - (height / 2);
    }

    setReferenceElement({
      getBoundingClientRect() {
        return {
          top: y,
          left: x,
          bottom: y,
          right: x,
          width: width,
          height: height,
          x: 0,
          y: 0,
          toJSON: () => '',
        };
      },
    });

    setOpen(true);
  };

  const closeContextMenu = () => {
    setOpen(false);
  };

  return {
    setElement,
    setArrowElement,
    styles,
    attributes,
    isOpen,
    setOpen,
    openContextMenu,
    closeContextMenu,
  };

}