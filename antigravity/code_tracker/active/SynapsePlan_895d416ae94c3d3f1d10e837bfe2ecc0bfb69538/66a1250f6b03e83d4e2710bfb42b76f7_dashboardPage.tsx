ê0import { useQuery } from '@tanstack/react-query';
import { getProjects } from '../services/projects';
import { getTasks } from '../services/tasks';
import { Task } from '../types/task'; // Import Task
import { Box, Grid, CircularProgress, Alert } from '@mui/material';
import { useState } from 'react';
import GreetingWidget from '../components/dashboard/GreetingWidget';
import PulseCard from '../components/dashboard/PulseCard';
import RecentTasksTable from '../components/dashboard/RecentTasksTable';
import ContributionGraph from '../components/dashboard/ContributionGraph';
import DashboardGantt from '../components/dashboard/DashboardGantt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';


const DashboardPage = () => {
    const [taskLoadErrors, setTaskLoadErrors] = useState<string[]>([]);

    // 1. Fetch Projects
    const {
        data: projects = [],
        isLoading: isLoadingProjects,
        error: projectsError
    } = useQuery({
        queryKey: ['projects'],
        queryFn: getProjects
    });

    // 2. Fetch Tasks
    const {
        data: tasks = [],
        isLoading: isLoadingTasks
    } = useQuery({
        queryKey: ['allTasks', projects],
        queryFn: async () => {
            if (!projects.length) return [];
            setTaskLoadErrors([]); // Reset errors on new fetch
            const results = await Promise.allSettled(
                projects.map((p: any) => 
                    getTasks(p.id).then(projectTasks => 
                        projectTasks.map((t: any) => ({ ...t, project_name: p.name }))
                    )
                )
            );
            const fulfilledTasks = results
                .filter(result => result.status === 'fulfilled')
                .map(result => (result as PromiseFulfilledResult<Task[]>).value)
                .flat();
            const rejectedReasons = results
                .filter(result => result.status === 'rejected')
                .map(result => (result as PromiseRejectedResult).reason.message || "Unknown error"); // Access error message

            if (rejectedReasons.length > 0) {
                setTaskLoadErrors(rejectedReasons);
            }
            return fulfilledTasks;
        },
        enabled: projects.length > 0
    });

    const isLoading = isLoadingProjects || (projects.length > 0 && isLoadingTasks);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (projectsError || taskLoadErrors.length > 0) {
        return (
            <Box sx={{ p: 3 }}>
                {projectsError && <Alert severity="error">Failed to load projects: {projectsError.message}. Please try again.</Alert>}
                {taskLoadErrors.length > 0 && (
                    <Alert severity="warning" sx={{ mt: projectsError ? 2 : 0 }}>
                        Failed to load tasks for some projects. Details: {taskLoadErrors.join('; ')}
                    </Alert>
                )}
            </Box>
        );
    }

    // Calculate Stats
    const totalProjects = projects.length;
    const items = tasks; // all tasks
    const completedTasks = items.filter((t: any) => t.status === 'Completed').length;
    const activeTasksCount = items.filter((t: any) => t.status !== 'Completed').length;
    const pendingReview = items.filter((t: any) => t.status === 'Review').length;

    // Mock calculations
    const teamVelocity = Math.floor(completedTasks * 1.2);

    return (
        <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
            <Box sx={{ mb: 4 }}> {/* Removed flex properties */}
                <GreetingWidget tasksDueToday={activeTasksCount} />
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <PulseCard
                        title="Active Projects"
                        value={totalProjects}
                        trend={0}
                        trendLabel="vs last month"
                        icon={<FolderIcon fontSize="large" />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <PulseCard
                        title="Completed Tasks"
                        value={completedTasks}
                        trend={10}
                        trendLabel="tasks vs last week"
                        icon={<AssignmentIcon fontSize="large" />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <PulseCard
                        title="Pending Review"
                        value={pendingReview}
                        trend={-5}
                        trendLabel="in queue"
                        icon={<AccessTimeIcon fontSize="large" />}
                        color="warning"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <PulseCard
                        title="Team Velocity"
                        value={teamVelocity}
                        trend={12}
                        trendLabel="vs last week"
                        icon={<TrendingUpIcon fontSize="large" />}
                        color="info"
                    />
                </Grid>
            </Grid>

            {/* Overall Gantt Chart */}
            <Box sx={{ mb: 4 }}>
                <DashboardGantt />
            </Box>

            {/* Recent Tasks Table */}
            <Box sx={{ mb: 4 }}>
                <RecentTasksTable tasks={tasks} />
            </Box>

            {/* Contribution Graph */}
            <Box sx={{ mb: 4 }}>
                <ContributionGraph />
            </Box>
        </Box>
    );
};
export default DashboardPage;
ê0"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Xfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/pages/dashboardPage.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan