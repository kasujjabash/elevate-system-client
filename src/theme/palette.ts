import { colors } from '@material-ui/core';

const white = '#FFFFFF';

// Era92 Creative brand colors
const era92Coral = '#fe3a6a';
const era92Orange = '#fe8c45';
const era92Dark = '#1f2025';
const era92Beige = '#f3e4db';

const palette = {
  primary: {
    contrastText: white,
    dark: '#d4183f',
    main: era92Coral,
    light: era92Beige,
  },
  secondary: {
    contrastText: white,
    dark: '#c46a2e',
    main: era92Orange,
    light: '#fde8d4',
  },
  error: {
    contrastText: white,
    dark: colors.red[900],
    main: colors.red[600],
    light: colors.red[400],
  },
  text: {
    primary: era92Dark,
    secondary: '#5a5e6b',
  },
  background: {
    default: '#f8f7f5',
    paper: white,
  },
  links: {
    white: '#FFFFFF',
    black: '#000000',
  },
};
export default palette;
