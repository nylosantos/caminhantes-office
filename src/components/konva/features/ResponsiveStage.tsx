// src/components/konva/features/ResponsiveStage.tsx

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import Konva from 'konva';

import { ResponsiveStageProps } from '@/types/konva';
import { AppProviders } from '@/contexts';

const ResponsiveStage: React.FC<ResponsiveStageProps> = ({
  width,
  height,
  children,
  onStageClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);

  const [stageConfig, setStageConfig] = useState({
    scale: 1,
    x: 0,
    y: 0,
    containerWidth: 800,
    containerHeight: 600,
  });

  // Calcular escala responsiva
  const calculateScale = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calcular escala para caber no container
    const scaleX = containerWidth / width;
    const scaleY = containerHeight / height;
    const scale = Math.min(scaleX, scaleY, 1); // Não aumentar além do tamanho original

    // Centralizar o stage no container
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const x = (containerWidth - scaledWidth) / 2;
    const y = (containerHeight - scaledHeight) / 2;

    setStageConfig({
      scale,
      x,
      y,
      containerWidth,
      containerHeight,
    });
  }, [width, height]);

  // Atualizar escala quando o container redimensionar
  useEffect(() => {
    calculateScale();

    const handleResize = () => calculateScale();
    window.addEventListener('resize', handleResize);

    // Observer para mudanças no tamanho do container
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [calculateScale]);

  // Converter coordenadas do mouse para coordenadas do canvas
  const getCanvasCoordinates = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };

      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - stageConfig.x) / stageConfig.scale;
      const y = (clientY - rect.top - stageConfig.y) / stageConfig.scale;

      return { x, y };
    },
    [stageConfig]
  );

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const canvasCoords = getCanvasCoordinates(e.evt.clientX, e.evt.clientY);
      onStageClick();
    },
    [getCanvasCoordinates, onStageClick]
  );

  return (
    <div
      ref={containerRef}
      className="responsive-stage-container w-full h-full flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    >
      <div
        className="stage-wrapper"
        style={{
          width: width * stageConfig.scale,
          height: height * stageConfig.scale,
          transform: `translate(${stageConfig.x}px, ${stageConfig.y}px)`,
        }}
      >
        <AppProviders>
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            scaleX={stageConfig.scale}
            scaleY={stageConfig.scale}
            onClick={handleStageClick}
            onTap={handleStageClick}
          >
            {children}
          </Stage>
        </AppProviders>
      </div>

      {/* Informações de debug (desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 text-xs text-gray-500 bg-white bg-opacity-75 p-2 rounded">
          <div>
            Canvas: {width}x{height}
          </div>
          <div>
            Container: {stageConfig.containerWidth}x
            {stageConfig.containerHeight}
          </div>
          <div>Scale: {stageConfig.scale.toFixed(2)}</div>
          <div>
            Position: ({stageConfig.x.toFixed(0)}, {stageConfig.y.toFixed(0)})
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponsiveStage;
