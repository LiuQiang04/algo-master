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
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
