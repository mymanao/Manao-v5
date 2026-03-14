import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#69F000",
      light: "#8FFF3A",
      dark: "#4DB800",
      contrastText: "#0A0A0A",
    },
    secondary: {
      main: "#00BCD4",
      light: "#4DD0E1",
      dark: "#00838F",
      contrastText: "#0A0A0A",
    },
    background: {
      default: "#0D0D0D",
      paper: "#161616",
    },
    success: { main: "#69F000" },
    warning: { main: "#FFB300" },
    error: { main: "#FF5252" },
    info: { main: "#40C4FF" },
    text: {
      primary: "#EFEFEF",
      secondary: "#757575",
      disabled: "#424242",
    },
    divider: "rgba(255,255,255,0.07)",
    action: {
      hover: "rgba(105,240,0,0.05)",
      selected: "rgba(105,240,0,0.10)",
      disabledBackground: "rgba(255,255,255,0.05)",
    },
  },
  typography: {
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif",
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontWeight: 600, letterSpacing: "-0.01em" },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    overline: { fontWeight: 700, letterSpacing: "0.12em", fontSize: "0.65rem" },
    button: { fontWeight: 600, letterSpacing: "0.02em" },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        body { background: #0D0D0D; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: #424242; }
      `,
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          background: "#111111",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          background: "#161616",
          border: "1px solid rgba(255,255,255,0.07)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 6,
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
        containedPrimary: {
          color: "#0A0A0A",
          backgroundColor: "#69F000",
          "&:hover": { backgroundColor: "#7AFF10", boxShadow: "none" },
        },
        outlinedPrimary: {
          borderColor: "rgba(105,240,0,0.4)",
          color: "#69F000",
          "&:hover": {
            borderColor: "#69F000",
            backgroundColor: "rgba(105,240,0,0.05)",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.7rem", borderRadius: 4 },
        colorPrimary: {
          backgroundColor: "rgba(105,240,0,0.12)",
          color: "#69F000",
          border: "none",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "rgba(255,255,255,0.05)", padding: "10px 16px" },
        head: {
          fontWeight: 700,
          color: "#616161",
          fontSize: "0.7rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          background: "#111111",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": { backgroundColor: "rgba(255,255,255,0.02) !important" },
          "&:last-child td": { borderBottom: "none" },
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          "& .MuiSwitch-switchBase.Mui-checked": { color: "#69F000" },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#69F000",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
          "&:hover fieldset": {
            borderColor: "rgba(255,255,255,0.2) !important",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#69F000 !important",
            borderWidth: "1px !important",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: { root: { "&.Mui-focused": { color: "#69F000" } } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "#1A1A1A",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 8,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: { fontSize: "1rem", fontWeight: 600, padding: "20px 24px 16px" },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          "&.Mui-selected": {
            backgroundColor: "rgba(105,240,0,0.10)",
            "& .MuiListItemIcon-root": { color: "#69F000" },
            "& .MuiListItemText-primary": { color: "#69F000", fontWeight: 600 },
            "&:hover": { backgroundColor: "rgba(105,240,0,0.13)" },
          },
          "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: "rgba(105,240,0,0.12)", borderRadius: 2 },
        bar: { backgroundColor: "#69F000", borderRadius: 2 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: 6, border: "1px solid" },
        standardInfo: {
          borderColor: "rgba(64,196,255,0.2)",
          backgroundColor: "rgba(64,196,255,0.05)",
        },
        standardError: {
          borderColor: "rgba(255,82,82,0.2)",
          backgroundColor: "rgba(255,82,82,0.05)",
        },
        standardSuccess: {
          borderColor: "rgba(105,240,0,0.2)",
          backgroundColor: "rgba(105,240,0,0.05)",
        },
        standardWarning: {
          borderColor: "rgba(255,179,0,0.2)",
          backgroundColor: "rgba(255,179,0,0.05)",
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: "rgba(255,255,255,0.07)" } },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: "#2A2A2A",
          border: "1px solid rgba(255,255,255,0.1)",
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
          "&:hover": { backgroundColor: "rgba(255,255,255,0.05)" },
          "&.Mui-selected": {
            backgroundColor: "rgba(105,240,0,0.1)",
            "&:hover": { backgroundColor: "rgba(105,240,0,0.13)" },
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: { colorPrimary: { color: "#69F000" } },
    },
    MuiSlider: {
      styleOverrides: { root: { color: "#69F000" } },
    },
  },
});
