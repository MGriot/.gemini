èimport { TypographyOptions } from '@mui/material/styles/createTypography';

// Ensure this is installed: npm install @fontsource/plus-jakarta-sans

export const typography: TypographyOptions = {
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
        fontWeight: 700,
        lineHeight: 80 / 64,
        fontSize: '4rem',
    },
    h2: {
        fontWeight: 700,
        lineHeight: 64 / 48,
        fontSize: '3rem',
    },
    h3: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: '2rem',
    },
    h4: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: '1.5rem',
    },
    h5: {
        fontWeight: 600, // SemiBold
        lineHeight: 1.5,
        fontSize: '1.25rem',
    },
    h6: {
        fontWeight: 600, // SemiBold
        lineHeight: 28 / 18,
        fontSize: '1.125rem',
    },
    subtitle1: {
        fontWeight: 600,
        lineHeight: 1.5,
        fontSize: '1rem',
    },
    subtitle2: {
        fontWeight: 600,
        lineHeight: 22 / 14,
        fontSize: '0.875rem',
    },
    body1: {
        lineHeight: 1.5,
        fontSize: '1rem',
    },
    body2: {
        lineHeight: 22 / 14,
        fontSize: '0.875rem',
    },
    caption: {
        lineHeight: 1.5,
        fontSize: '0.75rem',
    },
    overline: {
        fontWeight: 700,
        lineHeight: 1.5,
        fontSize: '0.75rem',
        textTransform: 'uppercase',
    },
    button: {
        fontWeight: 700,
        lineHeight: 24 / 14,
        fontSize: '0.875rem',
        textTransform: 'none', // Remove uppercase default from Material UI
    },
};
è"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Tfile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/theme/typography.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan