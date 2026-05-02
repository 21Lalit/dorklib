import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/Navbar";
import { AdminSidebar } from "@/components/AdminSidebar";
import { Suspense, lazy } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";

// Public pages
const Home = lazy(() => import("@/pages/Home"));
const Dorks = lazy(() => import("@/pages/Dorks"));
const DorkDetail = lazy(() => import("@/pages/DorkDetail"));
const Categories = lazy(() => import("@/pages/Categories"));
const CategoryDetail = lazy(() => import("@/pages/CategoryDetail"));
const Trending = lazy(() => import("@/pages/Trending"));
const Recent = lazy(() => import("@/pages/Recent"));
const Collections = lazy(() => import("@/pages/Collections"));
const CollectionDetail = lazy(() => import("@/pages/CollectionDetail"));
const About = lazy(() => import("@/pages/About"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminDorks = lazy(() => import("@/pages/admin/AdminDorks"));
const AdminCategories = lazy(() => import("@/pages/admin/AdminCategories"));
const AdminTags = lazy(() => import("@/pages/admin/AdminTags"));
const AdminOperators = lazy(() => import("@/pages/admin/AdminOperators"));
const AdminPlatforms = lazy(() => import("@/pages/admin/AdminPlatforms"));
const AdminSources = lazy(() => import("@/pages/admin/Sources"));
const AdminIngestion = lazy(() => import("@/pages/admin/IngestionJobs"));
const AdminRawContent = lazy(() => import("@/pages/admin/RawContent"));
const AdminExtractedDorks = lazy(() => import("@/pages/admin/ExtractedDorks"));
const AdminAnalytics = lazy(() => import("@/pages/admin/Analytics"));
const AdminDiagrams = lazy(() => import("@/pages/admin/Diagrams"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    </div>
  );
}

function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/admin" component={AdminDashboard} />
            <Route path="/admin/dorks" component={AdminDorks} />
            <Route path="/admin/categories" component={AdminCategories} />
            <Route path="/admin/tags" component={AdminTags} />
            <Route path="/admin/operators" component={AdminOperators} />
            <Route path="/admin/platforms" component={AdminPlatforms} />
            <Route path="/admin/sources" component={AdminSources} />
            <Route path="/admin/ingestion" component={AdminIngestion} />
            <Route path="/admin/raw-content" component={AdminRawContent} />
            <Route path="/admin/extracted-dorks" component={AdminExtractedDorks} />
            <Route path="/admin/analytics" component={AdminAnalytics} />
            <Route path="/admin/diagrams" component={AdminDiagrams} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/dorks" component={Dorks} />
            <Route path="/dorks/:id" component={DorkDetail} />
            <Route path="/categories" component={Categories} />
            <Route path="/categories/:slug" component={CategoryDetail} />
            <Route path="/trending" component={Trending} />
            <Route path="/recent" component={Recent} />
            <Route path="/collections" component={Collections} />
            <Route path="/collections/:id" component={CollectionDetail} />
            <Route path="/about" component={About} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminLayout} />
      <Route path="/admin/:rest*" component={AdminLayout} />
      <Route component={PublicLayout} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster
          theme="dark"
          toastOptions={{
            style: {
              background: "hsl(220 24% 9%)",
              border: "1px solid hsl(220 20% 14%)",
              color: "hsl(195 100% 92%)",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
