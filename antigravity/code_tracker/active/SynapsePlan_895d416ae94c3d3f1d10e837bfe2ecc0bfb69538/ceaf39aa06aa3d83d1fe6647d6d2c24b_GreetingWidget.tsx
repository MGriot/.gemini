©import { Box, Typography, Paper, useTheme } from '@mui/material';
import { format } from 'date-fns';

interface GreetingWidgetProps {
    userName?: string;
    tasksDueToday?: number;
}

const GreetingWidget: React.FC<GreetingWidgetProps> = ({ userName = 'User', tasksDueToday = 0 }) => {
    const theme = useTheme();
    const timeOfDay = new Date().getHours();
    let greeting = 'Good Morning';
    if (timeOfDay >= 12 && timeOfDay < 18) greeting = 'Good Afternoon';
    if (timeOfDay >= 18) greeting = 'Good Evening';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 4,
                borderRadius: '24px',
                backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                mb: 4
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)',
            }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 1.2 }}>
                    {format(new Date(), 'EEEE, MMMM do, yyyy')}
                </Typography>
                <Typography variant="h3" fontWeight="800" sx={{ mb: 1 }}>
                    {greeting}, {userName}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600 }}>
                    Here's what's happening in your workspace today. You have {tasksDueToday} active tasks.
                </Typography>
            </Box>
        </Paper>
    );
};

export default GreetingWidget;
©"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382hfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/components/dashboard/GreetingWidget.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan