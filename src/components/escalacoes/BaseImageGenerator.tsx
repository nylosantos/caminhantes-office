import React, { useCallback, useEffect, useRef, useState } from 'react';
import domtoimage from 'dom-to-image';
import { Download, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LayerManager from '../generator//LayerManager_Refactored';
import PositionController from './PositionController_Refactored';

// Interfaces base
export interface CanvasElement {
  id: string;
  type: 'image' | 'text' | 'component';
  content: string | string[] | React.ReactNode;
  position: { x: number; y: number }; // Em %
  size: { width: number; height: number }; // Em %
  style?: React.CSSProperties;
  zIndex: number;
  visible: boolean;
  locked?: boolean;
}

export interface ElementConfig {
  canvasWidth: number;
  canvasHeight: number;
  [key: string]: any; // Para propriedades específicas de cada generator
}

export interface BaseImageGeneratorProps {
  // Configurações básicas
  configs: Record<'quadrada' | 'vertical' | 'horizontal', ElementConfig>;
  activeImageType: 'quadrada' | 'vertical' | 'horizontal';

  // Elementos para renderizar
  elements: CanvasElement[];
  onElementsChange: (elements: CanvasElement[]) => void;

  // Controle de camadas
  renderOrder: string[];
  onRenderOrderChange: (order: string[]) => void;

  // Controles de geração
  generating: boolean;
  onGenerateStart: () => void;
  onGenerateEnd: () => void;

  // Customizações opcionais
  className?: string;
  showLayerManager?: boolean;
  showPositionController?: boolean;
  showDownloadButton?: boolean;
  downloadFileName?: string;

  // Callbacks personalizados
  onElementSelect?: (elementId: string | null) => void;
  onBeforeGenerate?: () => Promise<void>;
  onAfterGenerate?: (dataUrl: string) => Promise<void>;
}

const BaseImageGenerator: React.FC<BaseImageGeneratorProps> = ({
  configs,
  activeImageType,
  elements,
  onElementsChange,
  renderOrder,
  onRenderOrderChange,
  generating,
  onGenerateStart,
  onGenerateEnd,
  className = '',
  showLayerManager = true,
  showPositionController = true,
  showDownloadButton = true,
  downloadFileName = 'imagem_gerada',
  onElementSelect,
  onBeforeGenerate,
  onAfterGenerate,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [downloadable, setDownloadable] = useState(false);

  const config = configs[activeImageType];
  const [blobUrls, setBlobUrls] = useState<Record<string, string>>({});
  // Função para converter Base64 em Blob URL
  const createObjectURLFromBase64 = (base64String: string): string => {
    // Extrai o tipo MIME (por exemplo, 'image/jpeg') e a parte codificada
    const arr = base64String.split(',');
    const mime = arr[0]?.match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const blob = new Blob([u8arr], { type: mime });
    return URL.createObjectURL(blob);
  };
  useEffect(() => {
    const newBlobUrls: Record<string, string> = {};
    const elementsToProcess = elements.filter(
      (el) =>
        el.type === 'image' &&
        typeof el.content === 'string' &&
        el.content.startsWith('data:image')
    );

    elementsToProcess.forEach((el) => {
      newBlobUrls[el.id] = createObjectURLFromBase64(el.content as string);
    });

    setBlobUrls(newBlobUrls);

    // Limpa as URLs de Blob antigas para evitar vazamento de memória
    return () => {
      Object.values(newBlobUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [elements]);

  // Atualiza z-index dos elementos baseado na renderOrder
  useEffect(() => {
    const updatedElements = elements.map((el) => ({
      ...el,
      zIndex: renderOrder.indexOf(el.id),
    }));
    onElementsChange(updatedElements);
  }, [renderOrder]);

  // Callback para seleção de elemento
  const handleElementSelect = useCallback(
    (elementId: string | null) => {
      setSelectedElementId(elementId);
      onElementSelect?.(elementId);
    },
    [onElementSelect]
  );

  // Função para atualizar elemento específico
  const updateElement = useCallback(
    (elementId: string, updates: Partial<CanvasElement>) => {
      const updatedElements = elements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      );
      onElementsChange(updatedElements);
    },
    [elements, onElementsChange]
  );

  // Função para atualizar posição de elemento
  const updateElementPosition = useCallback(
    (elementId: string, x: number, y: number) => {
      updateElement(elementId, { position: { x, y } });
    },
    [updateElement]
  );

  // Função para atualizar tamanho de elemento
  const updateElementSize = useCallback(
    (elementId: string, width: number, height: number) => {
      updateElement(elementId, { size: { width, height } });
    },
    [updateElement]
  );

  // Handlers de mouse para drag and drop
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, elementId: string) => {
      if (!canvasRef.current) return;

      const element = elements.find((el) => el.id === elementId);
      if (!element || element.locked) return;

      e.preventDefault();
      e.stopPropagation();

      setSelectedElementId(elementId);
      setIsDragging(true);

      const rect = canvasRef.current.getBoundingClientRect();
      const startX = ((e.clientX - rect.left) / rect.width) * 100;
      const startY = ((e.clientY - rect.top) / rect.height) * 100;

      setDragStart({
        x: startX - element.position.x,
        y: startY - element.position.y,
      });
    },
    [elements]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !selectedElementId || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = ((e.clientX - rect.left) / rect.width) * 100;
      const currentY = ((e.clientY - rect.top) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100, currentX - dragStart.x));
      const newY = Math.max(0, Math.min(100, currentY - dragStart.y));

      updateElementPosition(selectedElementId, newX, newY);
    },
    [isDragging, selectedElementId, dragStart, updateElementPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart({ x: 0, y: 0 });
  }, []);

  // Event listeners para mouse
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Função para download da imagem
  // const downloadImage = useCallback(async () => {
  //   if (!canvasRef.current) return;

  //   try {
  //     onGenerateStart();

  //     // Callback personalizado antes da geração
  //     if (onBeforeGenerate) {
  //       await onBeforeGenerate();
  //     }

  //     const dataUrl = await domtoimage.toPng(canvasRef.current, {
  //       width: config.canvasWidth,
  //       height: config.canvasHeight,
  //       style: {
  //         width: `${config.canvasWidth}px`,
  //         height: `${config.canvasHeight}px`,
  //       },
  //       quality: 1,
  //     });

  //     // Callback personalizado após a geração
  //     if (onAfterGenerate) {
  //       await onAfterGenerate(dataUrl);
  //     } else {
  //       // Download padrão
  //       const a = document.createElement('a');
  //       a.href = dataUrl;
  //       a.download = `${downloadFileName}_${activeImageType}.png`;
  //       a.click();
  //     }

  //     setDownloadable(true);
  //   } catch (error) {
  //     console.error('Erro ao gerar a imagem:', error);
  //   } finally {
  //     onGenerateEnd();
  //   }
  // }, [
  //   config,
  //   activeImageType,
  //   downloadFileName,
  //   onGenerateStart,
  //   onGenerateEnd,
  //   onBeforeGenerate,
  //   onAfterGenerate,
  // ]);
  const downloadImage = useCallback(async () => {
    if (!canvasRef.current) return;

    const canvasNode = canvasRef.current;

    try {
      onGenerateStart();

      // Salvar os estilos originais para restaurar depois
      const originalStyle = canvasNode.style.cssText;

      // Aplicar estilos temporários com as dimensões corretas
      canvasNode.style.width = `${config.canvasWidth}px`;
      canvasNode.style.height = `${config.canvasHeight}px`;
      canvasNode.style.paddingBottom = '0';

      // Atraso assíncrono para garantir que o navegador renderize a nova dimensão
      await new Promise((resolve) => requestAnimationFrame(resolve));

      // Callback antes da geração
      if (onBeforeGenerate) {
        await onBeforeGenerate();
      }

      // Capturar a imagem
      const dataUrl = await domtoimage.toPng(canvasNode, {
        quality: 1,
        width: config.canvasWidth,
        height: config.canvasHeight,
      });

      // Restaurar os estilos originais imediatamente
      canvasNode.style.cssText = originalStyle;

      // Callback após a geração
      if (onAfterGenerate) {
        await onAfterGenerate(dataUrl);
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${downloadFileName}_${activeImageType}.png`;
        a.click();
      }

      setDownloadable(true);
    } catch (error) {
      console.error('Erro ao gerar a imagem:', error);
    } finally {
      onGenerateEnd();
    }
  }, [
    config,
    activeImageType,
    downloadFileName,
    onGenerateStart,
    onGenerateEnd,
    onBeforeGenerate,
    onAfterGenerate,
  ]);

  // Elemento selecionado para o PositionController
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {/* Canvas Principal */}
      <div className="relative md:col-span-2">
        <div
          ref={canvasRef}
          className="relative border bg-white overflow-hidden cursor-crosshair"
          style={{
            width: '100%',
            paddingBottom: `${
              (config.canvasHeight / config.canvasWidth) * 100
            }%`,
          }}
          onClick={() => handleElementSelect(null)}
        >
          {/* Renderizar elementos ordenados por renderOrder */}
          {renderOrder
            .map((id) => elements.find((el) => el.id === id))
            .filter(Boolean)
            .map((element) => {
              if (!element || !element.visible) return null;
              return (
                <>
                  {console.log('ELEMENTO: ', element)}
                  <div
                    key={element.id}
                    className={`absolute cursor-move select-none ${
                      selectedElementId === element.id
                        ? 'ring-2 ring-teal-500'
                        : ''
                    } ${element.locked ? 'cursor-not-allowed opacity-75' : ''}`}
                    style={{
                      // left: `0%`,
                      left: `${element.position.x}%`,
                      // top: `0%`,
                      top: `${element.position.y}%`,
                      width: `${element.size.width}%`,
                      height: `${element.size.height}%`,
                      transform: 'translate(-50%, -50%)',
                      zIndex: element.zIndex,
                      ...element.style,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleElementSelect(element.id);
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                  >
                    {/* Renderizar conteúdo baseado no tipo */}
                    {element.type === 'image' &&
                      typeof element.content === 'string' && (
                        <img
                          src={
                            blobUrls[element.id] || (element.content as string)
                          }
                          alt={element.id}
                          className="w-full h-full object-cover"
                          draggable={false}
                        />
                      )}

                    {/* {element.type === 'text' &&
                    typeof element.content === 'string' && (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-bold"
                        style={{
                          fontSize: '2rem',
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                        }}
                      >
                        {element.content}
                      </div>
                    )} */}
                    {element.type === 'text' && (
                      <div
                        key={element.id}
                        className=""
                        style={{
                          position: 'absolute',
                          left: `${element.position.x}%`,
                          top: `${element.position.y}%`,
                          zIndex: element.zIndex,
                          width: `${element.size.width}%`,
                          height: `${element.size.height}%`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems:
                            element.style?.textAlign === 'right'
                              ? 'flex-end'
                              : 'flex-start',
                        }}
                      >
                        {/* 💡 Lógica para lidar com o array de strings */}
                        {Array.isArray(element.content) &&
                          element.content.map((line, index) => (
                            <>
                              <span
                                key={index}
                                style={{
                                  ...element.style,
                                  lineHeight: '1.2em', // Adiciona espaçamento entre as linhas
                                  whiteSpace: 'nowrap', // Impede quebras de linha indesejadas
                                }}
                              >
                                {line}
                              </span>
                            </>
                          ))}
                      </div>
                    )}

                    {element.type === 'component' &&
                      React.isValidElement(element.content) && (
                        <div className="w-full h-full">{element.content}</div>
                      )}
                  </div>
                </>
              );
            })}
        </div>

        {/* Botão de Download */}
        {showDownloadButton && (
          <div className="mt-4 flex justify-center">
            <Button
              onClick={downloadImage}
              disabled={generating}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {generating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Imagem
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Controles Laterais */}
      <div className="space-y-6">
        {/* Layer Manager */}
        {showLayerManager && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Gerenciar Camadas</h3>
            <LayerManager
              elements={elements}
              onElementsChange={onElementsChange}
              renderOrder={renderOrder}
              onRenderOrderChange={onRenderOrderChange}
              selectedElementId={selectedElementId}
              onElementSelect={handleElementSelect}
            />
          </div>
        )}

        {/* Position Controller */}
        {showPositionController && (
          <div>
            <PositionController
              selectedElement={
                selectedElement
                  ? {
                      id: selectedElement.id,
                      position: selectedElement.position,
                      size: selectedElement.size,
                    }
                  : null
              }
              onPositionChange={updateElementPosition}
              onSizeChange={updateElementSize}
              maxSize={500} // Permite até 500% de tamanho
            />
          </div>
        )}

        {/* Informações do elemento selecionado */}
        {selectedElement && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Elemento Selecionado</h4>
            <p className="text-sm text-gray-600">ID: {selectedElement.id}</p>
            <p className="text-sm text-gray-600">
              Tipo: {selectedElement.type}
            </p>
            <p className="text-sm text-gray-600">
              Posição: {selectedElement.position.x.toFixed(1)}%,{' '}
              {selectedElement.position.y.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              Tamanho: {selectedElement.size.width.toFixed(1)}% ×{' '}
              {selectedElement.size.height.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              Status: {selectedElement.visible ? 'Visível' : 'Oculto'}
              {selectedElement.locked ? ' • Bloqueado' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseImageGenerator;
