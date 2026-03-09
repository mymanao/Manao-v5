import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { CommandsPage } from "./pages/manager/Commands";
import { ConfigPage } from "./pages/manager/Config";
import { RepliesPage } from "./pages/manager/Replies";
import { ChannelPointsPage } from "./pages/manager/ChannelPoints";
import { QueuePage } from "./pages/Queue";
import { ChatOverlay } from "./pages/overlay/Chat";
import { FeedOverlay } from "./pages/overlay/Feed";
import { MusicOverlay } from "./pages/overlay/Music";

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/commands" element={<CommandsPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/replies" element={<RepliesPage />} />
            <Route path="/channel-points" element={<ChannelPointsPage />} />
            <Route path="/queue" element={<QueuePage />} />
            <Route path="/overlay/chat" element={<ChatOverlay />} />
            <Route path="/overlay/feed" element={<FeedOverlay />} />
            <Route path="/overlay/music" element={<MusicOverlay />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
}
