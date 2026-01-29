ú5import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, CircularProgress } from '@mui/material';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskDetailModal from '../tasks/TaskDetailModal';
import { Task } from '../../types/task';
import { getTasks, updateTask } from '../../services/tasks';

const COLUMNS = [
    { id: 'Not Started', title: 'Not Started' },
    { id: 'In Progress', title: 'In Progress' },
    { id: 'On Hold', title: 'On Hold' },
    { id: 'Review', title: 'Review' },
    { id: 'Completed', title: 'Completed' },
];

const KanbanBoard = ({ projectId, refreshTrigger }: { projectId?: string | number, refreshTrigger?: number }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (projectId) {
            setIsLoading(true);
            getTasks(projectId).then(fetchedTasks => {
                setTasks(fetchedTasks);
                setIsLoading(false);
            }).catch(console.error);
        }
    }, [projectId, refreshTrigger]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        const activeTask = tasks.find(t => String(t.id) === activeId);
        if (!activeTask) return;

        // Verify if dropping over a column or another task
        const isOverColumn = COLUMNS.some(col => col.id === overId);

        if (isOverColumn) {
            // If dropping directly over a column container that is different from current status
            if (activeTask.status !== overId) {
                setTasks((items) => {
                    const activeIndex = items.findIndex((t) => String(t.id) === activeId);
                    const newItems = [...items];
                    newItems[activeIndex].status = overId as string;
                    return newItems;
                });
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            setActiveId(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTask = tasks.find(t => String(t.id) === activeId);
        const overTask = tasks.find(t => String(t.id) === overId);

        let newStatus = activeTask?.status;

        // Dropping on another task
        if (activeTask && overTask && activeTask !== overTask) {
            setTasks((items) => {
                const oldIndex = items.findIndex((t) => String(t.id) === activeId);
                const newIndex = items.findIndex((t) => String(t.id) === overId);

                // If moving between columns, ensure status updates
                if (activeTask.status !== overTask.status) {
                    items[oldIndex].status = overTask.status;
                    newStatus = overTask.status;
                }

                return arrayMove(items, oldIndex, newIndex);
            });
        }
        // Dropping on a column (empty or not)
        else if (activeTask) {
            const isOverColumn = COLUMNS.some(col => col.id === overId);
            if (isOverColumn && activeTask.status !== overId) {
                setTasks((items) => {
                    const activeIndex = items.findIndex(t => String(t.id) === activeId);
                    const newItems = [...items];
                    newItems[activeIndex].status = overId as string;
                    newStatus = overId as string;
                    return arrayMove(newItems, activeIndex, activeIndex);
                });
            }
        }

        if (activeTask && newStatus && newStatus !== activeTask.status) {
            // Persist change to backend
            // In a real app we might want optimistic updates handled more carefully
            updateTask(activeTask.id, { status: newStatus }).catch(err => {
                console.error("Failed to update task status:", err);
                // Revert logic would go here
            });
        }

        setActiveId(null);
    };

    const activeTask = activeId ? tasks.find(t => String(t.id) === activeId) : null;

    if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <Box sx={{
                display: 'flex',
                overflowX: 'auto',
                height: '100%',
                pb: 2,
                px: 2,
                '&::-webkit-scrollbar': { height: 8 },
                '&::-webkit-scrollbar-thumb': { borderRadius: 4, bgcolor: 'divider' }
            }}>
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={tasks.filter(t => t.status === col.id)}
                        onTaskClick={handleTaskClick}
                    />
                ))}
            </Box>

            <DragOverlay>
                {activeTask ? <TaskCard task={activeTask} /> : null}
            </DragOverlay>

            <TaskDetailModal
                open={isModalOpen}
                onClose={handleModalClose}
                task={selectedTask}
            />
        </DndContext>
    );
};

export default KanbanBoard;
ú5"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382bfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/kanban/KanbanBoard.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan