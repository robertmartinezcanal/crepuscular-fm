import { Layout } from "@/components/Layout";
import { Toaster } from "@/components/ui/sonner";
import AdminNewsPage from "@/pages/AdminNewsPage";
import HomePage from "@/pages/HomePage";
import NewsDetailPage from "@/pages/NewsDetailPage";
import NewsPage from "@/pages/NewsPage";
import SchedulePage from "@/pages/SchedulePage";
import StationPage from "@/pages/StationPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const newsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noticias",
  component: NewsPage,
});

const newsDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/noticias/$id",
  component: NewsDetailPage,
});

const scheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/programacion",
  component: SchedulePage,
});

const stationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/emisora",
  component: StationPage,
});

const adminNewsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/noticias",
  component: AdminNewsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  newsRoute,
  newsDetailRoute,
  scheduleRoute,
  stationRoute,
  adminNewsRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
