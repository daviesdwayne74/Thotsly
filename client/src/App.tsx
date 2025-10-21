import { Toaster } from "@/components/ui/sonner";
import { useRoute, Redirect, Route } from "wouter";
import { trpc } from "./lib/trpc";
import CreatorFeed from "./pages/CreatorFeed";
import CreatorProfile from "./pages/CreatorProfile";
import UserProfile from "./pages/UserProfile";
import LiveStream from "./pages/LiveStream";
import Messages from "./pages/Messages";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorAnalytics from "./pages/CreatorAnalytics";
import CreatorSubscribers from "./pages/CreatorSubscribers";
import CreatorPosts from "./pages/CreatorPosts";
import CreatorFlowchart from "./pages/CreatorFlowchart";
import EliteProgram from "./pages/EliteProgram";
import MerchShop from "./pages/MerchShop";
import AdminPanel from "./pages/AdminPanel";
import IdVerification from "./pages/IdVerification";
import Stories from "./pages/Stories";
import EmailPreferences from "./pages/EmailPreferences";
import VodLibrary from "./pages/VodLibrary";
import CreatorOnboarding from './pages/CreatorOnboarding';
import AdminDashboard from "./pages/AdminDashboard";
import AdminPayments from "./pages/AdminPayments";
import AdminPayouts from "./pages/AdminPayouts";
import AdminCreators from "./pages/AdminCreators";
import AdminSettings from "./pages/AdminSettings";
import PayoutDashboard from "./pages/PayoutDashboard";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdultContentPolicy from "./pages/AdultContentPolicy";
import IllegalAndBannedContent from "./pages/IllegalAndBannedContent";
import CodeOfConduct from "./pages/CodeOfConduct";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [match] = useRoute("/admin/*");
  const { data: user, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (match && (!user || user.role !== "admin")) {
    return <Redirect to="/" />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      <AdminRoute>
        <Route path={"/"} component={CreatorFeed} />
        <Route path={"/creators/:id"} component={CreatorProfile} />
        <Route path={"/users/:id"} component={UserProfile} />
        <Route path={"/live/:id"} component={LiveStream} />
        <Route path={"/messages"} component={Messages} />
        <Route path={"/dashboard"} component={CreatorDashboard} />
        <Route path={"/analytics"} component={CreatorAnalytics} />
        <Route path={"/subscribers"} component={CreatorSubscribers} />
        <Route path={"/posts"} component={CreatorPosts} />
        <Route path={"/flowchart"} component={CreatorFlowchart} />
        <Route path={"/terms-of-service"} component={TermsOfService} />
        <Route path={"/privacy-policy"} component={PrivacyPolicy} />
        <Route path={"/adult-content-policy"} component={AdultContentPolicy} />
        <Route path="/illegal-and-banned-content" component={IllegalAndBannedContent} />
        <Route path="/code-of-conduct" component={CodeOfConduct} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path={"/elite-program"} component={EliteProgram} />
        <Route path={"/merch"} component={MerchShop} />
        <Route path={"/admin"} component={AdminPanel} />
        <Route path={"/verify-id"} component={IdVerification} />
        <Route path={"/stories"} component={Stories} />
        <Route path={"/email-preferences"} component={EmailPreferences} />
        <Route path={"/vod-library"} component={VodLibrary} />
        <Route path={"/creator-onboarding"} component={CreatorOnboarding} />
        <Route path={"/payout-dashboard"} component={PayoutDashboard} />
        <Route path={"/admin/payments"} component={AdminPayments} />
        <Route path={"/admin/payouts"} component={AdminPayouts} />
        <Route path={"/admin/creators"} component={AdminCreators} />
        <Route path={"/admin/settings"} component={AdminSettings} />
      </AdminRoute>
      <Toaster />
    </>
  );
}

export default App;

