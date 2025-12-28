
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import SnowEffect from "./components/SnowEffect";
import NotificationSystem from "./components/NotificationSystem";
import AchievementSystem from "./components/AchievementSystem";
import Index from "./pages/Index";
import Teams from "./pages/Teams";
import Tournaments from "./pages/Tournaments";
import Rating from "./pages/Rating";
import Ratings from "./pages/Ratings";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminTournaments from "./pages/AdminTournaments";
import AdminNews from "./pages/AdminNews";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Forum from "./pages/Forum";
import ForumTopic from "./pages/ForumTopic";
import Payment from "./pages/Payment";
import PaymentHistory from "./pages/PaymentHistory";
import CMS from "./pages/CMS";
import PageEditor from "./pages/PageEditor";
import Achievements from "./pages/Achievements";
import TournamentBracket from "./pages/TournamentBracket";
import CreateTeam from "./pages/CreateTeam";
import TeamProfile from "./pages/TeamProfile";
import UserProfile from "./pages/UserProfile";
import MatchDetails from "./pages/MatchDetails";
import Rules from "./pages/Rules";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SnowEffect />
      <NotificationSystem />
      <AchievementSystem />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/rating" element={<Rating />} />
          <Route path="/ratings" element={<Ratings />} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/tournaments" element={<ProtectedRoute requireAdmin><AdminTournaments /></ProtectedRoute>} />
          <Route path="/admin/news" element={<ProtectedRoute requireAdmin><AdminNews /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyEmail />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/payment-history" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:slug" element={<ForumTopic />} />
          <Route path="/cms" element={<ProtectedRoute requireAdmin><CMS /></ProtectedRoute>} />
          <Route path="/cms/page-editor" element={<ProtectedRoute requireAdmin><PageEditor /></ProtectedRoute>} />
          <Route path="/tournaments/:id/bracket" element={<TournamentBracket />} />
          <Route path="/teams/create" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
          <Route path="/teams/:id" element={<TeamProfile />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/matches/:matchId" element={<MatchDetails />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/support" element={<Support />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;