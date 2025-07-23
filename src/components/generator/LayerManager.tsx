// src/components/generators/LayerManager.tsx

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Componente para cada item da lista que pode ser arrastado
function SortableItem({ id }: { id: string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="flex items-center justify-between p-2 bg-gray-100 rounded-md mb-2 touch-none"
        >
            <span className="font-display-medium text-sm capitalize">{id}</span>
            <button {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-gray-500" />
            </button>
        </li>
    );
}

interface LayerManagerProps {
    renderOrder: string[];
    setRenderOrder: (order: string[]) => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({ renderOrder, setRenderOrder }) => {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = renderOrder.indexOf(active.id as string);
            const newIndex = renderOrder.indexOf(over.id as string);
            setRenderOrder(arrayMove(renderOrder, oldIndex, newIndex));
        }
    }

    return (
        <div>
            <label className="block text-sm font-display-bold text-gray-700 mb-2">
                Ordem das Camadas
            </label>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={renderOrder}
                    strategy={verticalListSortingStrategy}
                >
                    <ul className="list-none p-0">
                        {renderOrder.map(id => <SortableItem key={id} id={id} />)}
                    </ul>
                </SortableContext>
            </DndContext>
        </div>
    );
};

export default LayerManager;
