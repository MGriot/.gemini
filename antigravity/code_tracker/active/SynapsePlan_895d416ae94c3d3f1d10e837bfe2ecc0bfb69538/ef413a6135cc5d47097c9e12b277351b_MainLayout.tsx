÷Nimport React, { useState } from 'react';
import { Outlet, useLocation, Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
    Typography,
    IconButton,
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Button
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FolderIcon from '@mui/icons-material/Folder';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Moon icon for dark mode
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Sun icon for light mode
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Admin icon
import { alpha } from '@mui/material/styles';
import { useProjectCreation } from '../context/ProjectCreationContext'; // Import the hook
import { useThemeMode } from '../context/ThemeContext'; // Import the theme context hook
import { useAuth } from '../context/AuthContext'; // Import Auth context hook

const DRAWER_WIDTH = 280;

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Projects', path: '/projects', icon: <FolderIcon /> },
    { label: 'Tasks', path: '/tasks', icon: <AssignmentIcon /> },
    // { label: 'Calendar', path: '/calendar', icon: <CalendarTodayIcon /> },
];

const MainLayout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { openCreateProjectModal } = useProjectCreation(); // Use the hook
    const { mode, toggleColorMode } = useThemeMode(); // Use theme mode context
    const { user } = useAuth(); // Use auth context
    const isSuperuser = user?.is_superuser;

    const navItems = [...NAV_ITEMS];
    if (isSuperuser) {
        navItems.push({ label: 'Admin', path: '/admin', icon: <AdminPanelSettingsIcon /> });
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            // Glassmorphism logic handled in Drawer overrides or here locally
            bgcolor: isMobile ? 'background.paper' : alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(12px)',
        }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Placeholder Logo */}
                <Box sx={{ width: 40, height: 40, bgcolor: 'primary.main', borderRadius: '12px' }} />
                <Typography variant="h6" color="text.primary">SynapsePlan</Typography>

                {/* Theme Toggle Button */}
                <IconButton sx={{ ml: 'auto' }} onClick={toggleColorMode} color="inherit">
                    {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                </IconButton>
            </Box>

            <List sx={{ px: 2, flexGrow: 1 }}>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.label} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                component={RouterLink}
                                to={item.path}
                                selected={isActive}
                                sx={{
                                    borderRadius: '12px',
                                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    color: isActive ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        color: 'text.primary',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: 'inherit',
                                    minWidth: 40,
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        variant: 'body2',
                                        fontWeight: isActive ? 600 : 500
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* New Project Button at the bottom */}
            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<AddIcon />}
                    onClick={openCreateProjectModal}
                >
                    New Project
                </Button>
            </Box>

            <Box sx={{ p: 2 }}>
                <Box sx={{
                    p: 2,
                    borderRadius: '16px',
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user?.name ? user.name[0] : (user?.email ? user.email[0].toUpperCase() : 'U')}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2">
                            {user?.name && user?.surname ? `${user.name} ${user.surname}` : (user?.email || 'User')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isSuperuser ? 'Administrator' : 'Free Plan'}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            bgcolor: 'transparent', // Transparent to allow background glass
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* Mobile Drawer (Temporary) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                {isMobile && (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' }, mb: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                )}
                <Outlet />

                {/* Spacer for bottom nav on mobile */}
                {isMobile && <Box sx={{ height: 64 }} />}
            </Box>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
                    <BottomNavigation
                        showLabels
                        value={location.pathname}
                        onChange={() => {
                            // Requires useNavigate hook or direct Link components
                        }}
                    >
                        {navItems.map((item) => (
                            <BottomNavigationAction
                                key={item.label}
                                label={item.label}
                                icon={item.icon}
                                component={RouterLink}
                                to={item.path}
                                value={item.path}
                            />
                        ))}
                    </BottomNavigation>
                </Paper>
            )}
        </Box>
    );
};

export default MainLayout;
÷N"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Wfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/layouts/MainLayout.tsx:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan