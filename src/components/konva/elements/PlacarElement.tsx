import React, { useEffect, useState } from 'react';
import { Group, Image as KonvaImage, Rect, Text } from 'react-konva';
import { createRoot } from 'react-dom/client';
import domtoimage from 'dom-to-image';

import { CanvasElement, FormatConfig, PlacarElementData } from '@/types/konva';
import SplitRectangleDisplay from '@/components/SplitRectangleDisplay';
import Konva from 'konva';
import { BaseImage } from '@/types/images';
import { AppProviders } from '@/contexts';

interface PlacarElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onClick: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (newPosition: { x: number; y: number }) => void;
  onTransform: (newAttrs: Partial<CanvasElement>) => void;
  baseImages: BaseImage[];
  formatConfig?: FormatConfig;
}

const PlacarElement: React.FC<PlacarElementProps> = ({
  element,
  isSelected,
  onClick,
  onDragEnd,
  onTransform,
  baseImages,
  formatConfig,
}) => {
  const data = element.data as PlacarElementData;
  const [placarImage, setPlacarImage] = useState<HTMLImageElement | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsGenerating(true);

    const tempContainer = document.createElement('div');
    tempContainer.style.width = '1280px';
    tempContainer.style.height = '720px';
    // tempContainer.style.position = 'absolute';
    // tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    const root = createRoot(tempContainer);
    root.render(
      <AppProviders>
        <SplitRectangleDisplay
          selectedMatch={data.selectedMatch}
          homeScore={data.homeScore || null}
          awayScore={data.awayScore || null}
          homePenScore={data.homePenScore || null}
          awayPenScore={data.awayPenScore || null}
          logoOffset={data.logoOffset || 0}
          logoFadePercentage={data.logoFadePercentage || 0}
        />
      </AppProviders>
    );

    const timeoutId = setTimeout(async () => {
      try {
        const dataUrl = await domtoimage.toPng(tempContainer);
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
          setPlacarImage(img);
          root.unmount();
          document.body.removeChild(tempContainer);
          // ✅ Fim do carregamento com sucesso
          setIsGenerating(false);
        };

        img.onerror = () => {
          console.error('Erro ao carregar a imagem do placar.');
          setPlacarImage(null);
          root.unmount();
          document.body.removeChild(tempContainer);
          // ✅ Fim do carregamento com erro
          setIsGenerating(false);
        };

        img.src = dataUrl;
      } catch (error) {
        console.error('Erro ao gerar imagem:', error);
        setPlacarImage(null);
        root.unmount();
        document.body.removeChild(tempContainer);
        // ✅ Fim do carregamento com erro
        setIsGenerating(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (document.body.contains(tempContainer)) {
        root.unmount();
        document.body.removeChild(tempContainer);
      }
    };
  }, [JSON.stringify(data)]);

  const renderPlaceholder = () => {
    let text = 'Sem dados do placar';

    if (isGenerating) {
      text = 'Gerando placar...';
    } else if (error) {
      text = error;
    } else if (data.selectedMatch) {
      text = 'Carregando placar...';
    }

    return (
      <>
        <Rect
          width={element.size.width}
          height={element.size.height}
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth={2}
          cornerRadius={8}
        />
        <Text
          text={text}
          x={element.size.width / 2}
          y={element.size.height / 2}
          offsetX={text.length * 4} // Aproximação para centralizar
          offsetY={10}
          fontSize={16}
          fill={error ? '#ef4444' : '#6b7280'}
          fontFamily="Arial"
        />
        {isGenerating && (
          <Rect
            x={element.size.width / 2 - 50}
            y={element.size.height / 2 + 20}
            width={100}
            height={4}
            fill="#e5e7eb"
            cornerRadius={2}
          />
        )}
      </>
    );
  };
  useEffect(() => {
    console.log('imagem do placar:', placarImage);
  }, [placarImage]);

  return (
    <Group
      x={element.position.x}
      y={element.position.y}
      width={element.size.width}
      height={element.size.height}
      onClick={onClick}
      onTap={onClick}
      draggable={isSelected}
      onDragEnd={(e) => {
        onTransform?.({
          ...element,
          position: {
            x: e.target.x(),
            y: e.target.y(),
          },
        });
      }}
    >
      {placarImage ? (
        <KonvaImage
          image={placarImage}
          width={element.size.width}
          height={element.size.height}
          listening={true}
        />
      ) : (
        renderPlaceholder()
      )}
    </Group>
  );
};

export default PlacarElement;
