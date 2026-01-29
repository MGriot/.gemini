ÿimport { createTheme, ThemeOptions } from '@mui/material/styles';
import { palette } from './palette';
import { typography } from './typography';
import { components } from './components';

export const themeOptions: ThemeOptions = {
    palette,
    typography,
    shape: { borderRadius: 12 },
    // shadows: ... (Define custom shadows if needed, defaulting to MuiCard override)
};

const theme = createTheme(themeOptions);
theme.components = components(theme) as any;

export default theme;
ÿ"(895d416ae94c3d3f1d10e837bfe2ecc0bfb695382Ofile:///c:/Users/Admin/Documents/Coding/SynapsePlan/frontend/src/theme/index.ts:3file:///c:/Users/Admin/Documents/Coding/SynapsePlan