import { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Edit3,
  Trophy,
  Target,
  Flame,
  Star,
  TrendingUp,
  Code2,
  CheckCircle2,
  Award,
  Shield,
  Zap,
  ChevronRight,
} from 'lucide-react';
import './Profile.css';

const mockUser = {
  username: 'algorithm_master',
  displayName: '算法大师',
  email: 'master@example.com',
  bio: '热爱算法，享受解题的乐趣。专注数据结构与算法竞赛。',
  avatar: null,
  joinDate: '2025-03-15',
  location: '北京',
  level: 42,
  experience: 18500,
  nextLevelExp: 20000,
  rating: 2156,
  rank: 128,
  stats: {
    solved: 486,
    easy: 180,
    medium: 230,
    hard: 76,
    totalSubmissions: 2340,
    acceptanceRate: 72.5,
    streak: 15,
    maxStreak: 42,
    contests: 28,
    bestRank: 12,
    avgRating: 2050,
  },
  achievements: [
    { id: 1, name: '初出茅庐', desc: '完成第一道题目', icon: Star, color: 'amber', unlocked: true },
    { id: 2, name: '百题斩', desc: '完成 100 道题目', icon: Target, color: 'blue', unlocked: true },
    { id: 3, name: '连续签到', desc: '连续 7 天签到', icon: Flame, color: 'orange', unlocked: true },
    { id: 4, name: '竞赛达人', desc: '参加 10 场竞赛', icon: Trophy, color: 'purple', unlocked: true },
    { id: 5, name: '困难征服者', desc: '完成 50 道困难题', icon: Shield, color: 'red', unlocked: true },
    { id: 6, name: '速度之星', desc: '在 5 分钟内 AC 一道题', icon: Zap, color: 'cyan', unlocked: true },
    { id: 7, name: '全能选手', desc: '完成所有类型的题目', icon: Award, color: 'gold', unlocked: false },
    { id: 8, name: '算法大师', desc: 'Rating 达到 2400', icon: Star, color: 'diamond', unlocked: false },
  ],
  recentSubmissions: [
    { id: 1, problem: '两数之和', status: 'accepted', time: '2 小时前', lang: 'C++', runtime: '56ms' },
    { id: 2, problem: '最长回文子串', status: 'wrong_answer', time: '3 小时前', lang: 'Python', runtime: '-' },
    { id: 3, problem: '合并 K 个升序链表', status: 'accepted', time: '5 小时前', lang: 'C++', runtime: '128ms' },
    { id: 4, problem: '二叉树的层序遍历', status: 'accepted', time: '昨天', lang: 'Java', runtime: '12ms' },
    { id: 5, problem: '有效的括号', status: 'accepted', time: '昨天', lang: 'Python', runtime: '32ms' },
    { id: 6, problem: '最大子数组和', status: 'time_limit', time: '2 天前', lang: 'C++', runtime: '-' },
    { id: 7, problem: '接雨水', status: 'accepted', time: '2 天前', lang: 'C++', runtime: '8ms' },
    { id: 8, problem: '搜索旋转排序数组', status: 'accepted', time: '3 天前', lang: 'Java', runtime: '0ms' },
  ],
  weeklyActivity: [3, 5, 2, 8, 4, 6, 1],
};

const statusLabels: Record<string, { text: string; class: string }> = {
  accepted: { text: '通过', class: 'accepted' },
  wrong_answer: { text: '错误', class: 'wrong' },
  time_limit: { text: '超时', class: 'timeout' },
  runtime_error: { text: '运行错误', class: 'error' },
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'achievements'>('overview');

  const user = mockUser;
  const expPercent = (user.experience / user.nextLevelExp) * 100;

  return (
    <div className="profile-page">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-cover">
            <div className="profile-cover-gradient" />
          </div>
          <div className="profile-info">
            <div className="profile-avatar">
              <User size={40} />
            </div>
            <div className="profile-details">
              <div className="profile-name-row">
                <h1 className="profile-name">{user.displayName}</h1>
                <span className="profile-level">Lv.{user.level}</span>
                <button className="profile-edit-btn">
                  <Edit3 size={14} />
                  编辑资料
                </button>
              </div>
              <p className="profile-username">@{user.username}</p>
              <p className="profile-bio">{user.bio}</p>
              <div className="profile-meta">
                <span className="profile-meta-item">
                  <Mail size={14} />
                  {user.email}
                </span>
                <span className="profile-meta-item">
                  <MapPin size={14} />
                  {user.location}
                </span>
                <span className="profile-meta-item">
                  <Calendar size={14} />
                  {new Date(user.joinDate).toLocaleDateString('zh-CN')} 加入
                </span>
              </div>
            </div>
            <div className="profile-rating-card">
              <div className="profile-rating-value">{user.rating}</div>
              <div className="profile-rating-label">竞赛 Rating</div>
              <div className="profile-rating-rank">全球排名 #{user.rank}</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-icon profile-stat-icon--blue">
              <Target size={20} />
            </div>
            <div className="profile-stat-content">
              <div className="profile-stat-value">{user.stats.solved}</div>
              <div className="profile-stat-label">已解题目</div>
            </div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon profile-stat-icon--green">
              <CheckCircle2 size={20} />
            </div>
            <div className="profile-stat-content">
              <div className="profile-stat-value">{user.stats.acceptanceRate}%</div>
              <div className="profile-stat-label">通过率</div>
            </div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon profile-stat-icon--orange">
              <Flame size={20} />
            </div>
            <div className="profile-stat-content">
              <div className="profile-stat-value">{user.stats.streak}</div>
              <div className="profile-stat-label">连续天数</div>
            </div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon profile-stat-icon--purple">
              <Trophy size={20} />
            </div>
            <div className="profile-stat-content">
              <div className="profile-stat-value">{user.stats.contests}</div>
              <div className="profile-stat-label">参与竞赛</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'overview' ? 'profile-tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            概览
          </button>
          <button
            className={`profile-tab ${activeTab === 'submissions' ? 'profile-tab--active' : ''}`}
            onClick={() => setActiveTab('submissions')}
          >
            提交记录
          </button>
          <button
            className={`profile-tab ${activeTab === 'achievements' ? 'profile-tab--active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            成就徽章
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="profile-content">
            <div className="profile-grid">
              {/* Left Column */}
              <div className="profile-col">
                {/* Progress */}
                <div className="profile-card">
                  <h3 className="profile-card-title">
                    <TrendingUp size={18} />
                    学习进度
                  </h3>
                  <div className="progress-section">
                    <div className="progress-header">
                      <span>经验进度</span>
                      <span>{user.experience.toLocaleString()} / {user.nextLevelExp.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${expPercent}%` }} />
                    </div>
                  </div>
                  <div className="difficulty-progress">
                    <div className="diff-prog-item">
                      <div className="diff-prog-header">
                        <span className="diff-prog-label diff-prog-label--easy">简单</span>
                        <span>{user.stats.easy} / 300</span>
                      </div>
                      <div className="progress-bar progress-bar--sm">
                        <div className="progress-fill progress-fill--easy" style={{ width: `${(user.stats.easy / 300) * 100}%` }} />
                      </div>
                    </div>
                    <div className="diff-prog-item">
                      <div className="diff-prog-header">
                        <span className="diff-prog-label diff-prog-label--medium">中等</span>
                        <span>{user.stats.medium} / 500</span>
                      </div>
                      <div className="progress-bar progress-bar--sm">
                        <div className="progress-fill progress-fill--medium" style={{ width: `${(user.stats.medium / 500) * 100}%` }} />
                      </div>
                    </div>
                    <div className="diff-prog-item">
                      <div className="diff-prog-header">
                        <span className="diff-prog-label diff-prog-label--hard">困难</span>
                        <span>{user.stats.hard} / 200</span>
                      </div>
                      <div className="progress-bar progress-bar--sm">
                        <div className="progress-fill progress-fill--hard" style={{ width: `${(user.stats.hard / 200) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Activity */}
                <div className="profile-card">
                  <h3 className="profile-card-title">
                    <Calendar size={18} />
                    本周活跃度
                  </h3>
                  <div className="weekly-chart">
                    {user.weeklyActivity.map((count, i) => {
                      const dayLabels = ['一', '二', '三', '四', '五', '六', '日'];
                      const maxCount = Math.max(...user.weeklyActivity);
                      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div key={i} className="weekly-bar-group">
                          <div className="weekly-bar-wrapper">
                            <div
                              className="weekly-bar"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="weekly-label">周{dayLabels[i]}</span>
                          <span className="weekly-count">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="profile-col">
                {/* Recent Submissions */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <h3 className="profile-card-title">
                      <Code2 size={18} />
                      最近提交
                    </h3>
                    <button className="profile-card-link" onClick={() => setActiveTab('submissions')}>
                      查看全部 <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="submission-list">
                    {user.recentSubmissions.slice(0, 5).map((sub) => (
                      <div key={sub.id} className="submission-item">
                        <div className="submission-left">
                          <span className={`submission-status submission-status--${statusLabels[sub.status].class}`}>
                            {statusLabels[sub.status].text}
                          </span>
                          <span className="submission-problem">{sub.problem}</span>
                        </div>
                        <div className="submission-right">
                          <span className="submission-lang">{sub.lang}</span>
                          <span className="submission-time">{sub.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Achievements */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <h3 className="profile-card-title">
                      <Award size={18} />
                      最近解锁
                    </h3>
                    <button className="profile-card-link" onClick={() => setActiveTab('achievements')}>
                      查看全部 <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="achievement-mini-list">
                    {user.achievements.filter((a) => a.unlocked).slice(0, 4).map((ach) => {
                      const Icon = ach.icon;
                      return (
                        <div key={ach.id} className={`achievement-mini achievement-mini--${ach.color}`}>
                          <div className="achievement-mini-icon">
                            <Icon size={20} />
                          </div>
                          <div className="achievement-mini-info">
                            <span className="achievement-mini-name">{ach.name}</span>
                            <span className="achievement-mini-desc">{ach.desc}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="profile-content">
            <div className="profile-card">
              <h3 className="profile-card-title">
                <Code2 size={18} />
                提交历史
              </h3>
              <div className="submission-table-wrapper">
                <table className="submission-table">
                  <thead>
                    <tr>
                      <th>题目</th>
                      <th>状态</th>
                      <th>语言</th>
                      <th>运行时间</th>
                      <th>提交时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.recentSubmissions.map((sub) => (
                      <tr key={sub.id}>
                        <td className="submission-problem-cell">{sub.problem}</td>
                        <td>
                          <span className={`submission-status submission-status--${statusLabels[sub.status].class}`}>
                            {statusLabels[sub.status].text}
                          </span>
                        </td>
                        <td>{sub.lang}</td>
                        <td className="submission-runtime">{sub.runtime}</td>
                        <td className="submission-time-cell">{sub.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="profile-content">
            <div className="achievements-grid">
              {user.achievements.map((ach) => {
                const Icon = ach.icon;
                return (
                  <div
                    key={ach.id}
                    className={`achievement-card ${ach.unlocked ? `achievement-card--unlocked achievement-card--${ach.color}` : 'achievement-card--locked'}`}
                  >
                    <div className="achievement-card-icon">
                      <Icon size={28} />
                    </div>
                    <h4 className="achievement-card-name">{ach.name}</h4>
                    <p className="achievement-card-desc">{ach.desc}</p>
                    {!ach.unlocked && (
                      <div className="achievement-card-lock">
                        <Shield size={14} />
                        未解锁
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
