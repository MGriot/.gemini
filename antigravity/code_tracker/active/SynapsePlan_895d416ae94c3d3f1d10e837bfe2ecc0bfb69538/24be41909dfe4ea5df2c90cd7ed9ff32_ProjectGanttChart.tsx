‡Aimport React, { useMemo } from 'react';
import { Task } from '../../types/task';
import { Box, Typography, Paper, Tooltip, Zoom } from '@mui/material';
import { addDays, format, differenceInDays, min, max, isValid } from 'date-fns';

interface ProjectGanttChartProps {
    tasks: Task[];
}

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ tasks }) => {
    // 1. Prepare Data
    const { processedTasks, minDate, totalDays } = useMemo(() => {
        if (!tasks || tasks.length === 0) return { processedTasks: [], minDate: new Date(), totalDays: 0 };

        const flatTasks: { id: string | number; name: string; start: Date; end: Date; status: string; type: 'Task' | 'Subtask' }[] = [];
        const taskDates: Date[] = [];

        // Helper to safely parse date or return specific fallback
        const safeDate = (d: string | undefined, fallback: Date): Date => {
            if (!d) return fallback;
            const parsed = new Date(d);
            return isValid(parsed) ? parsed : fallback;
        };

        tasks.forEach(t => {
            const fallbackStart = t.created_at ? safeDate(t.created_at, new Date()) : new Date();
            const start = safeDate(t.start_date, fallbackStart);
            const end = safeDate(t.end_date, addDays(start, 2));

            taskDates.push(start, end);
            flatTasks.push({ id: t.id, name: t.name, start, end, status: t.status, type: 'Task' });

            if (t.subtasks) {
                t.subtasks.forEach(s => {
                    const sStart = safeDate(s.start_date, start);
                    const sEnd = safeDate(s.end_date, end);
                    taskDates.push(sStart, sEnd);
                    flatTasks.push({ id: `sub-${s.id}`, name: s.name, start: sStart, end: sEnd, status: s.status, type: 'Subtask' });
                });
            }
        });

        if (taskDates.length === 0) return { processedTasks: [], minDate: new Date(), totalDays: 0 };

        const minD = min(taskDates);
        const maxD = addDays(max(taskDates), 2); // Buffer
        const days = differenceInDays(maxD, minD) || 1;

        return { processedTasks: flatTasks, minDate: minD, totalDays: days };
    }, [tasks]);

    if (!tasks || tasks.length === 0) {
        return (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'background.default' }}>
                <Typography color="text.secondary">No timeline data available.</Typography>
            </Paper>
        );
    }

    // Colors
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return '#4caf50';
            case 'in progress': return '#2196f3';
            case 'review': return '#ff9800';
            case 'on hold': return '#d32f2f'; // Red
            default: return '#9e9e9e';
        }
    };

    return (
        <Paper sx={{ p: 3, mb: 4, overflow: 'hidden', borderRadius: 3, boxShadow: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Project Timeline
            </Typography>

            <Box sx={{ overflowX: 'auto', pb: 2 }}>
                <Box sx={{ minWidth: 800, position: 'relative' }}>

                    {/* Header: Months/Days */}
                    <Box sx={{ display: 'flex', borderBottom: '1px solid #eee', mb: 2, pb: 1 }}>
                        <Box sx={{ width: 200, flexShrink: 0, fontWeight: 'bold', color: 'text.secondary' }}>Task</Box>
                        {/* Simple Day Ticks */}
                        <Box sx={{ flexGrow: 1, position: 'relative', height: 24 }}>
                            {Array.from({ length: totalDays > 30 ? 6 : totalDays }).map((_, i) => {
                                // Show optimized ticks
                                const tickDate = addDays(minDate, i * (totalDays > 30 ? Math.ceil(totalDays / 6) : 1));
                                const left = (differenceInDays(tickDate, minDate) / totalDays) * 100;
                                if (left > 100) return null;
                                return (
                                    <Typography key={i} variant="caption" sx={{ position: 'absolute', left: `${left}%`, transform: 'translateX(-50%)', color: 'text.disabled' }}>
                                        {isValid(tickDate) ? format(tickDate, 'MMM d') : ''}
                                    </Typography>
                                );
                            })}
                        </Box>
                    </Box>

                    {/* Rows */}
                    {processedTasks.map((task) => {
                        const startOffset = differenceInDays(task.start, minDate);
                        const duration = differenceInDays(task.end, task.start) || 1;
                        const leftPercent = Math.max(0, (startOffset / totalDays) * 100);
                        const widthPercent = Math.min(100 - leftPercent, (duration / totalDays) * 100);

                        return (
                            <Box key={task.id} sx={{ display: 'flex', alignItems: 'center', mb: 1.5, height: 32, '&:hover': { bgcolor: 'action.hover', borderRadius: 1 } }}>
                                {/* Label */}
                                <Box sx={{ width: 200, flexShrink: 0, pr: 2, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="body2" noWrap sx={{
                                        fontWeight: task.type === 'Task' ? 500 : 400,
                                        pl: task.type === 'Subtask' ? 2 : 0,
                                        color: task.type === 'Subtask' ? 'text.secondary' : 'text.primary'
                                    }}>
                                        {task.type === 'Subtask' && 'â†³ '} {task.name}
                                    </Typography>
                                </Box>

                                {/* Bar */}
                                <Box sx={{ flexGrow: 1, position: 'relative', height: '100%' }}>
                                    <Tooltip
                                        title={
                                            <Box sx={{ p: 0.5 }}>
                                                <Typography variant="subtitle2">{task.name}</Typography>
                                                <Typography variant="caption" display="block">
                                                    {isValid(task.start) ? format(task.start, 'MMM d') : '?'} - {isValid(task.end) ? format(task.end, 'MMM d') : '?'}
                                                </Typography>
                                                <Typography variant="caption">{task.status}</Typography>
                                            </Box>
                                        }
                                        TransitionComponent={Zoom}
                                        arrow
                                    >
                                        <Box sx={{
                                            position: 'absolute',
                                            left: `${leftPercent}%`,
                                            width: `${Math.max(widthPercent, 0.5)}%`,
                                            height: 20,
                                            top: 6,
                                            bgcolor: getStatusColor(task.status),
                                            borderRadius: 4,
                                            cursor: 'pointer',
                                            transition: 'width 0.3s, left 0.3s',
                                            boxShadow: 1,
                                            '&:hover': { filter: 'brightness(1.1)', transform: 'scaleY(1.1)' }
                                        }} />
                                    </Tooltip>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Paper>
    );
};

export default ProjectGanttChart;
‡A"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382jfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/projects/ProjectGanttChart.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan