import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#7C3AED", // purple-600
      light: "#A78BFA",
      dark: "#5B21B6",
    },
    secondary: {
      main: "#06B6D4", // cyan-500
      light: "#67E8F9",
      dark: "#0891B2",
    },
    background: {
      default: "#0F0F13",
      paper: "#1A1A24",
    },
    success: { main: "#22C55E" },
    warning: { main: "#F59E0B" },
    error: { main: "#EF4444" },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
    divider: "rgba(255,255,255,0.08)",
  },
  typography: {
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        body { background: #0F0F13; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #1A1A24; }
        ::-webkit-scrollbar-thumb { background: #7C3AED; border-radius: 3px; }
      `,
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 600 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "rgba(255,255,255,0.06)" },
        head: { fontWeight: 700, color: "#94A3B8", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": { color: "#7C3AED" },
          "&.Mui-checked + .MuiSwitch-track": { backgroundColor: "#7C3AED" },
        },
      },
    },
  },
});
