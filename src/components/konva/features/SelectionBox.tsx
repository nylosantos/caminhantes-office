// src/components/konva/features/SelectionBox.tsx

import React from 'react';
import { Rect } from 'react-konva';

import { CanvasElement } from '@/types/konva';

interface SelectionBoxProps {
  element: CanvasElement;
  visible: boolean;
}

const SelectionBox: React.FC<SelectionBoxProps> = ({
  element,
  visible
}) => {
  if (!visible) return null;

  return (
    <Rect
      x={element.position.x - 2}
      y={element.position.y - 2}
      width={element.size.width + 4}
      height={element.size.height + 4}
      fill="transparent"
      stroke="#3b82f6"
      strokeWidth={2}
      strokeDashArray={[5, 5]}
      listening={false}
    />
  );
};

export default SelectionBox;

