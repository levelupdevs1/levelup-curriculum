import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AuthRoute from "./components/AuthRoute/AuthRoute";
import HomeRoute from "./components/HomeRoute/HomeRoute";
import OnboardingRoute from "./components/OnboardingRoute/OnboardingRoute";
import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Onboarding from "./pages/Onboarding/Onboarding";
import Dashboard from "./pages/Dashboard/Dashboard";
import AICatalog from "./pages/AICatalog/AICatalog";
import AICourseDetail from "./pages/AICourseDetail/AICourseDetail";
import AILessonViewer from "./pages/AILessonViewer/AILessonViewer";
import PeerReview from "./pages/PeerReview/PeerReview";
import Rewards from "./pages/Rewards/Rewards";
import Certificates from "./pages/Certificates/Certificates";
import Discussion from "./pages/Discussion/Discussion";
import DiscussionDetail from "./pages/DiscussionDetail/DiscussionDetail";
import Profile from "./pages/Profile/Profile";
import NotFound from "./pages/NotFound/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomeRoute,
      },
      {
        path: "landing",
        Component: () => (
          <AuthRoute>
            <Landing />
          </AuthRoute>
        ),
      },
      {
        path: "login",
        Component: () => (
          <AuthRoute>
            <Login />
          </AuthRoute>
        ),
      },
      {
        path: "register",
        Component: () => (
          <AuthRoute>
            <Register />
          </AuthRoute>
        ),
      },
      {
        path: "onboarding",
        Component: () => (
          <OnboardingRoute>
            <Onboarding />
          </OnboardingRoute>
        ),
      },
      {
        path: "dashboard",
        Component: () => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "course-catalog",
        Component: () => (
          <ProtectedRoute>
            <AICatalog />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId",
        Component: () => (
          <ProtectedRoute>
            <AICourseDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/lessons/:lessonId",
        Component: () => (
          <ProtectedRoute>
            <AILessonViewer />
          </ProtectedRoute>
        ),
      },
      {
        path: "courses/:courseId/lessons/:lessonId/review",
        Component: () => (
          <ProtectedRoute>
            <PeerReview />
          </ProtectedRoute>
        ),
      },
      {
        path: "rewards",
        Component: () => (
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        ),
      },
      {
        path: "certificates",
        Component: () => (
          <ProtectedRoute>
            <Certificates />
          </ProtectedRoute>
        ),
      },
      {
        path: "discussion",
        Component: () => (
          <ProtectedRoute>
            <Discussion />
          </ProtectedRoute>
        ),
      },
      {
        path: "discussion/:discussionId",
        Component: () => (
          <ProtectedRoute>
            <DiscussionDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        Component: () => (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
