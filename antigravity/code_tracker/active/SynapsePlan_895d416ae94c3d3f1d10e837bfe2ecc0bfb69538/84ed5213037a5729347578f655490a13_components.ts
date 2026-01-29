‘#import { Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

export const components = (theme: Theme) => ({
    MuiCssBaseline: {
        styleOverrides: {
            '*': {
                margin: 0,
                padding: 0,
                boxSizing: 'border-box',
            },
            html: {
                width: '100%',
                height: '100%',
                WebkitScrollingTouch: 'touch',
            },
            body: {
                width: '100%',
                height: '100%',
                backgroundColor: theme.palette.background.default,
            },
            '#root': {
                width: '100%',
                height: '100%',
            },
            // Scrollbar customization
            '::-webkit-scrollbar': {
                width: '8px',
                height: '8px',
            },
            '::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.grey[500], 0.24),
                borderRadius: '8px',
            },
            '::-webkit-scrollbar-thumb:hover': {
                background: alpha(theme.palette.grey[500], 0.48),
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                boxShadow: 'none', // Remove shadows
                borderRadius: '16px', // 16px radius
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                zIndex: 0, // Ensure it sits on surface-0 properly
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                backgroundImage: 'none',
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: '8px', // Adjusted for Pill shape manually if needed, 8px default comfortable
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: 'none',
                },
            },
            containedInherit: {
                color: theme.palette.common.white,
                backgroundColor: theme.palette.grey[800],
                '&:hover': {
                    color: theme.palette.common.white,
                    backgroundColor: theme.palette.grey[700],
                },
            },
            sizeLarge: {
                height: 48,
            },
            // Gradient / Enterprise specific overrides can go here
        },
    },
    MuiInputBase: {
        styleOverrides: {
            root: {
                borderRadius: '12px',
                '&.Mui-disabled': {
                    '& svg': { color: theme.palette.text.disabled },
                },
            },
        },
    },
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                borderRadius: '12px',
                '& fieldset': {
                    borderColor: alpha(theme.palette.grey[500], 0.32),
                },
                '&.Mui-focused fieldset': {
                    borderWidth: '1px !important', // Keep it clean 1px
                    borderColor: `${theme.palette.primary.main} !important`,
                },
            },
        },
    },
    MuiBackdrop: {
        styleOverrides: {
            root: {
                backgroundColor: alpha(theme.palette.grey[900], 0.8),
                backdropFilter: 'blur(6px)', // Glassmorphism backdrop
            },
            invisible: {
                background: 'transparent',
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: '16px',
                backgroundColor: theme.palette.background.paper,
                // Could enable glass here if desired, but solid is better for contrast
            },
        },
    },
    MuiTooltip: {
        styleOverrides: {
            tooltip: {
                backgroundColor: theme.palette.grey[800],
                fontSize: '0.8rem',
                borderRadius: '8px',
            },
            arrow: {
                color: theme.palette.grey[800],
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundColor: 'transparent', // Allow glassmorphism details or custom backgrounds
                borderRight: 'none',
            },
        },
    },
});
‘#"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Tfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/theme/components.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan