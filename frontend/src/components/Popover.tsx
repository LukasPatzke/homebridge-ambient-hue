import { useClickOutside } from '@mantine/hooks';
import { VirtualElement } from '@popperjs/core';
import {
  Chart,
  PointElement,
  PointHoverOptions,
  PointOptions,
  PointProps,
} from 'chart.js';
import React, { useState } from 'react';
import { usePopper } from 'react-popper';

interface PopoverProps {
  children?: React.ReactNode;

  chartRef: React.RefObject<Chart>;
  activePoint?: PointElement<PointProps, PointOptions & PointHoverOptions>;
}

export const Popover: React.FC<PopoverProps> = ({
  children,
  chartRef,
  activePoint,
}) => {
  const [isOpen, setOpen] = useState(false);
  const popperInnerRef = useClickOutside(() => setOpen(false));
  const [popperReferenceElement, setPoperReferenceElement] =
    useState<VirtualElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
    null,
  );
  const [popperArrowElement, setPopperArrowElement] =
    useState<HTMLDivElement | null>(null);

  const { styles, attributes } = usePopper(
    popperReferenceElement,
    popperElement,
    {
      placement: 'right',
      modifiers: [
        { name: 'arrow', options: { element: popperArrowElement } },
        {
          name: 'preventOverflow',
          options: {
            altAxis: true,
            // boundary: chartRef.current?.canvas
          },
        },
        { name: 'flip' },
      ],
    },
  );

  if (activePoint) {
    const chart = chartRef.current;
    if (chart) {
      const bounding = chart.canvas.getBoundingClientRect();
      const radius = activePoint.options.hoverRadius;
      const x = bounding.x + activePoint.x - radius;
      const y = bounding.y + activePoint.y - radius;

      setPoperReferenceElement({
        getBoundingClientRect() {
          return {
            top: y,
            left: x,
            bottom: y,
            right: x,
            width: radius * 2,
            height: radius * 2,
            x: 0,
            y: 0,
            toJSON: () => '',
          };
        },
      });
      setOpen(true);
    }
  } else {
    setOpen(false);
  }

  if (isOpen) {
    return (
      <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
        <div ref={popperInnerRef}>{children}</div>
        <div ref={setPopperArrowElement} style={styles.arrow} />
      </div>
    );
  }
  return null;
};
