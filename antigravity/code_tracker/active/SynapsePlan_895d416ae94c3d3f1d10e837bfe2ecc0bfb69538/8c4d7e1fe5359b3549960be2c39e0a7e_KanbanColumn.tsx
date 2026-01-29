ìimport React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Box, Typography, Paper, useTheme, alpha } from '@mui/material';
import TaskCard from './TaskCard';
import { Task } from '../../types/task';

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: Task[];
    onTaskClick?: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ id, title, tasks, onTaskClick }) => {
    const theme = useTheme();
    const { setNodeRef } = useDroppable({ id });

    return (
        <Paper
            sx={{
                width: 300,
                minWidth: 300,
                height: '100%',
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                mr: 3,
                maxHeight: 'calc(100vh - 120px)',
            }}
        >
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle1" fontWeight="700">
                    {title}
                </Typography>
                <Box sx={{
                    bgcolor: alpha(theme.palette.text.primary, 0.05),
                    px: 1,
                    borderRadius: '12px'
                }}>
                    <Typography variant="caption" fontWeight="600">
                        {tasks.length}
                    </Typography>
                </Box>
            </Box>

            <Box
                ref={setNodeRef}
                sx={{
                    flexGrow: 1,
                    p: 2,
                    pt: 0,
                    overflowY: 'auto',
                    minHeight: 150, // Ensure drop target is hittable even when empty
                }}
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                    ))}
                </SortableContext>
            </Box>
        </Paper>
    );
};

export default KanbanColumn;
ì"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382cfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/kanban/KanbanColumn.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan