import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import CommunityPage from './pages/CommunityPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import UserProfilePage from './pages/UserProfilePage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PlaceholderPage from './pages/PlaceholderPage';
import ProblemList from './pages/Problems/ProblemList';
import ProblemDetail from './pages/Problems/ProblemDetail';
import ContestList from './pages/Contests/ContestList';
import ContestDetail from './pages/Contests/ContestDetail';
import LearningPaths from './pages/LearningPaths/LearningPaths';
import LearningPathDetail from './pages/LearningPaths/LearningPathDetail';
import Profile from './pages/Profile/Profile';
import Home from './pages/Home/Home';
import {
  AchievementsPage,
  LeaderboardPage,
  DailyChallengePage,
  VirtualItemsPage,
  PointsPage,
} from './pages/Gamification';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      // 社区路由
      { path: 'community', element: <CommunityPage /> },
      { path: 'community/new', element: <CreatePostPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
      { path: 'users/:id', element: <UserProfilePage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'feed', element: <FeedPage /> },
      // 认证路由
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      // 题库路由
      { path: 'problems', element: <ProblemList /> },
      { path: 'problems/:id', element: <ProblemDetail /> },
      // 竞赛路由
      { path: 'contests', element: <ContestList /> },
      { path: 'contests/:id', element: <ContestDetail /> },
      // 学习路径路由
      { path: 'paths', element: <LearningPaths /> },
      { path: 'paths/:id', element: <LearningPathDetail /> },
      // 个人中心
      { path: 'profile', element: <Profile /> },
      // 游戏化系统路由
      { path: 'achievements', element: <AchievementsPage /> },
      { path: 'leaderboard', element: <LeaderboardPage /> },
      { path: 'daily-challenge', element: <DailyChallengePage /> },
      { path: 'virtual-items', element: <VirtualItemsPage /> },
      { path: 'points', element: <PointsPage /> },
      { path: 'gamification/achievements', element: <AchievementsPage /> },
      { path: 'gamification/leaderboard', element: <LeaderboardPage /> },
      { path: 'gamification/daily-challenge', element: <DailyChallengePage /> },
      { path: 'gamification/virtual-items', element: <VirtualItemsPage /> },
      { path: 'gamification/points', element: <PointsPage /> },
    ],
  },
]);
