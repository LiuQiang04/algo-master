import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/stores/useAuthStore';
import type { ReactNode } from 'react';

// Lazy load pages
import { lazy, Suspense } from 'react';
import { LoadingPage } from '@/components/UI';
import PageTransition from '@/components/PageTransition';

const Home = lazy(() => import('@/pages/Home/Home'));
const ProblemList = lazy(() => import('@/pages/Problems/ProblemList'));
const ProblemDetail = lazy(() => import('@/pages/Problems/ProblemDetail'));
const ContestList = lazy(() => import('@/pages/Contests/ContestList'));
const ContestDetail = lazy(() => import('@/pages/Contests/ContestDetail'));
const Profile = lazy(() => import('@/pages/Profile/Profile'));
const Login = lazy(() => import('@/pages/LoginPage'));
const Register = lazy(() => import('@/pages/RegisterPage'));
const LearningPaths = lazy(() => import('@/pages/LearningPaths/LearningPaths'));
const LearningPathDetail = lazy(() => import('@/pages/LearningPaths/LearningPathDetail'));
const CommunityPage = lazy(() => import('@/pages/CommunityPage'));
const CreatePostPage = lazy(() => import('@/pages/CreatePostPage'));
const PostDetailPage = lazy(() => import('@/pages/PostDetailPage'));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'));
const FeedPage = lazy(() => import('@/pages/FeedPage'));
const GamificationHub = lazy(() => import('@/pages/Gamification/GamificationHubPage'));
const AchievementsPage = lazy(() => import('@/pages/Gamification/AchievementsPage'));
const LeaderboardPage = lazy(() => import('@/pages/Gamification/LeaderboardPage'));
const DailyChallengePage = lazy(() => import('@/pages/Gamification/DailyChallengePage'));
const VirtualItemsPage = lazy(() => import('@/pages/Gamification/VirtualItemsPage'));
const PointsPage = lazy(() => import('@/pages/Gamification/PointsPage'));

function LazyPage({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<LoadingPage />}>
      <PageTransition>{children}</PageTransition>
    </Suspense>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LazyPage><Home /></LazyPage> },
      { path: 'problems', element: <LazyPage><ProblemList /></LazyPage> },
      { path: 'problems/:id', element: <LazyPage><ProblemDetail /></LazyPage> },
      { path: 'contests', element: <LazyPage><ContestList /></LazyPage> },
      { path: 'contests/:id', element: <LazyPage><ContestDetail /></LazyPage> },
      { path: 'profile', element: <ProtectedRoute><LazyPage><Profile /></LazyPage></ProtectedRoute> },
      { path: 'paths', element: <LazyPage><LearningPaths /></LazyPage> },
      { path: 'paths/:id', element: <LazyPage><LearningPathDetail /></LazyPage> },
      { path: 'login', element: <LazyPage><Login /></LazyPage> },
      { path: 'register', element: <LazyPage><Register /></LazyPage> },
      // 社区路由
      { path: 'community', element: <LazyPage><CommunityPage /></LazyPage> },
      { path: 'community/new', element: <LazyPage><CreatePostPage /></LazyPage> },
      { path: 'posts/:id', element: <LazyPage><PostDetailPage /></LazyPage> },
      { path: 'posts/:id/edit', element: <ProtectedRoute><LazyPage><CreatePostPage /></LazyPage></ProtectedRoute> },
      { path: 'users/:id', element: <LazyPage><UserProfilePage /></LazyPage> },
      { path: 'messages', element: <LazyPage><MessagesPage /></LazyPage> },
      { path: 'notifications', element: <LazyPage><NotificationsPage /></LazyPage> },
      { path: 'feed', element: <LazyPage><FeedPage /></LazyPage> },
      // 游戏化路由
      { path: 'gamification', element: <LazyPage><GamificationHub /></LazyPage> },
      { path: 'achievements', element: <LazyPage><AchievementsPage /></LazyPage> },
      { path: 'leaderboard', element: <LazyPage><LeaderboardPage /></LazyPage> },
      { path: 'daily-challenge', element: <LazyPage><DailyChallengePage /></LazyPage> },
      { path: 'virtual-items', element: <LazyPage><VirtualItemsPage /></LazyPage> },
      { path: 'points', element: <LazyPage><PointsPage /></LazyPage> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
