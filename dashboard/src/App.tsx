import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { CommandsPage } from "./pages/manager/Commands";
import { ConfigPage } from "./pages/customize/Config.tsx";
import { RepliesPage } from "./pages/manager/Replies";
import { ChannelPointsPage } from "./pages/manager/ChannelPoints";
import { QueuePage } from "./pages/Queue";
import { ChatOverlay } from "./pages/overlay/Chat";
import { FeedOverlay } from "./pages/overlay/Feed";
import { MusicOverlay } from "./pages/overlay/Music";
import { SoundOverlay } from "./pages/overlay/Sound";
import { SoundboardPage } from "./pages/Soundboard.tsx";
import { ScheduledMessagesPage } from "@/pages/manager/ScheduledMessages.tsx";
import {OverlaySettingsPage} from "@/pages/customize/Overlay.tsx";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/soundboard" element={<SoundboardPage />} />
            <Route path="/manager/commands" element={<CommandsPage />} />
            <Route path="/manager/replies" element={<RepliesPage />} />
            <Route path="/manager/channel-points" element={<ChannelPointsPage />} />
            <Route path="/manager/scheduled-messages" element={<ScheduledMessagesPage />} />
            <Route path="/overlay/chat" element={<ChatOverlay />} />
            <Route path="/overlay/feed" element={<FeedOverlay />} />
            <Route path="/overlay/music" element={<MusicOverlay />} />
            <Route path="/overlay/sound" element={<SoundOverlay />} />
            <Route path="/customize/config" element={<ConfigPage />} />
            <Route path="/customize/overlay" element={<OverlaySettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
