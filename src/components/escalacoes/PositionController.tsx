// Crie um novo arquivo, por exemplo: PositionController.tsx

import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PositionControllerProps {
    onMove: (axis: 'x' | 'y', amount: number) => void;
    onResize?: (amount: number) => void; // Opcional: para controlar o tamanho
    elementName: string;
}

const PositionController: React.FC<PositionControllerProps> = ({ onMove, onResize, elementName }) => {
    const moveAmount = 5; // Move 5 pixels por clique

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h4 className="text-lg font-display-bold mb-2 text-center">
                Ajustar Posição: <span className="text-red-600">{elementName}</span>
            </h4>
            <div className="flex items-center justify-center space-x-2">
                {/* Controles de Posição */}
                <Button variant="outline" size="icon" onClick={() => onMove('x', -moveAmount)}><ArrowLeft /></Button>
                <div className="flex flex-col space-y-1">
                    <Button variant="outline" size="icon" onClick={() => onMove('y', -moveAmount)}><ArrowUp /></Button>
                    <Button variant="outline" size="icon" onClick={() => onMove('y', moveAmount)}><ArrowDown /></Button>
                </div>
                <Button variant="outline" size="icon" onClick={() => onMove('x', moveAmount)}><ArrowRight /></Button>

                {/* Controles de Tamanho (Opcional) */}
                {onResize && (
                    <div className="ml-4 flex items-center space-x-2 border-l pl-4">
                        <Button variant="outline" size="icon" onClick={() => onResize(-moveAmount)}><Minus /></Button>
                        <span className="font-display-medium">Tamanho</span>
                        <Button variant="outline" size="icon" onClick={() => onResize(moveAmount)}><Plus /></Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PositionController;
