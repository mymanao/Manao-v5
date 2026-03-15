import { useState, useEffect } from "react";
import {
  CssBaseline,
  ThemeProvider,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  LinearProgress,
} from "@mui/material";
import WelcomePage from "./pages/Welcome";
import TwitchPage from "./pages/Twitch";
import DiscordPage from "./pages/Discord";
import KickPage from "./pages/Kick";
import YouTubePage from "./pages/YouTube";
import DonePage from "./pages/Done";
import { theme } from "../../dashboard/src/theme";

export interface SetupConfig {
  complete: boolean;
  twitch: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    botId: string;
    broadcasterId: string;
    broadcasterChannel: string;
    hasTokens: boolean;
  };
  discord: { enabled: boolean; token: string; hasToken: boolean };
  kick: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    hasTokens: boolean;
    ngrokAuthtoken: string;
    ngrokDomain: string;
  };
  youtube: {
    enabled: boolean;
    clientId: string;
    clientSecret: string;
    hasTokens: boolean;
  };
}

const STEPS = ["Welcome", "Twitch", "Discord", "Kick", "YouTube", "Done"];

export default function App() {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<SetupConfig | null>(null);

  useEffect(() => {
    fetch("/setup/api/config")
    .then((r) => r.json())
    .then((c: SetupConfig) => setConfig(c));
  }, []);

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  const reload = async () => {
    const c = await fetch("/setup/api/config").then((r) => r.json());
    setConfig(c);
  };

  if (!config) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LinearProgress />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.default",
          px: 2,
          py: 4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}>
          <Box
            component="img"
            src="https://gitlab.com/uploads/-/system/project/avatar/80096207/manao_mini.png?width=96"
            alt="Manao"
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: { xs: "none", md: "block" },
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: "text.primary",
              letterSpacing: "-0.02em",
              fontSize: { xs: "1.5rem", sm: "2rem" },
            }}
          >
            Manao Setup
          </Typography>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 4, width: "100%", maxWidth: 600 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ width: "100%", maxWidth: 600 }}>
          {step === 0 && <WelcomePage config={config} onNext={next} />}
          {step === 1 && (
            <TwitchPage
              config={config}
              onNext={next}
              onBack={back}
              onReload={reload}
            />
          )}
          {step === 2 && (
            <DiscordPage
              config={config}
              onNext={next}
              onBack={back}
              onReload={reload}
            />
          )}
          {step === 3 && (
            <KickPage
              config={config}
              onNext={next}
              onBack={back}
              onReload={reload}
            />
          )}
          {step === 4 && (
            <YouTubePage
              config={config}
              onNext={next}
              onBack={back}
              onReload={reload}
            />
          )}
          {step === 5 && <DonePage config={config} />}
        </Box>
      </Box>
    </ThemeProvider>
  );
}