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
      {
        index: true,
        element: (
          <div className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
            <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 16, background: 'linear-gradient(135deg, var(--primary-600), var(--accent-500))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              AlgoArena
            </h1>
            <p style={{ fontSize: 20, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 600, margin: '0 auto 40px' }}>
              Master algorithms through practice, competition, and community collaboration
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/community" style={{
                padding: '14px 32px', borderRadius: 'var(--radius-lg)',
                background: 'var(--primary-600)', color: 'white', fontWeight: 600, fontSize: 16,
              }}>Explore Community</a>
              <a href="/problems" style={{
                padding: '14px 32px', borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--primary-600)', color: 'var(--primary-600)',
                fontWeight: 600, fontSize: 16,
              }}>Browse Problems</a>
            </div>
          </div>
        ),
      },
      { path: 'community', element: <CommunityPage /> },
      { path: 'community/new', element: <CreatePostPage /> },
      { path: 'posts/:id', element: <PostDetailPage /> },
      { path: 'users/:id', element: <UserProfilePage /> },
      { path: 'messages', element: <MessagesPage /> },
      { path: 'notifications', element: <NotificationsPage /> },
      { path: 'feed', element: <FeedPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'problems', element: <PlaceholderPage title="Problems" description="Problem set and online judge coming soon. Practice algorithmic problems with real-time evaluation." /> },
      { path: 'contests', element: <PlaceholderPage title="Contests" description="Contest system coming soon. Participate in timed competitions and climb the leaderboard." /> },
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
