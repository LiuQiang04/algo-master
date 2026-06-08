import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Medal,
  Target,
  CheckCircle2,
  XCircle,
  Minus,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import './ContestDetail.css';

const mockContest = {
  id: 1,
  title: '周赛 #128',
  description: '本周算法周赛，涵盖数组、字符串、动态规划等经典题目。请在规定时间内完成所有题目，祝你好运！',
  startTime: '2026-06-08T20:00:00',
  endTime: '2026-06-08T22:00:00',
  duration: 7200, // seconds
  status: 'running' as const,
  participants: 1234,
  problems: [
    { order: 'A', title: '数字翻转', difficulty: 'easy', solved: 892, attempts: 1200 },
    { order: 'B', title: '字符串匹配', difficulty: 'medium', solved: 456, attempts: 980 },
    { order: 'C', title: '最短路径', difficulty: 'medium', solved: 234, attempts: 750 },
    { order: 'D', title: '区间覆盖', difficulty: 'hard', solved: 89, attempts: 520 },
  ],
};

interface RankEntry {
  rank: number;
  username: string;
  rating: number;
  totalScore: number;
  totalTime: number;
  penalty: number;
  problemResults: {
    order: string;
    status: 'solved' | 'failed' | 'none';
    attempts: number;
    time: number | null;
  }[];
  rankChange: number;
}

const mockRanking: RankEntry[] = [
  {
    rank: 1,
    username: 'algorithm_king',
    rating: 2456,
    totalScore: 400,
    totalTime: 185,
    penalty: 0,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 1, time: 12 },
      { order: 'B', status: 'solved', attempts: 1, time: 35 },
      { order: 'C', status: 'solved', attempts: 1, time: 58 },
      { order: 'D', status: 'solved', attempts: 2, time: 80 },
    ],
    rankChange: 2,
  },
  {
    rank: 2,
    username: 'code_ninja',
    rating: 2389,
    totalScore: 400,
    totalTime: 198,
    penalty: 20,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 1, time: 8 },
      { order: 'B', status: 'solved', attempts: 1, time: 42 },
      { order: 'C', status: 'solved', attempts: 2, time: 68 },
      { order: 'D', status: 'solved', attempts: 1, time: 80 },
    ],
    rankChange: -1,
  },
  {
    rank: 3,
    username: 'data_master',
    rating: 2312,
    totalScore: 300,
    totalTime: 95,
    penalty: 0,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 1, time: 15 },
      { order: 'B', status: 'solved', attempts: 1, time: 30 },
      { order: 'C', status: 'solved', attempts: 1, time: 50 },
      { order: 'D', status: 'failed', attempts: 3, time: null },
    ],
    rankChange: 1,
  },
  {
    rank: 4,
    username: 'binary_search',
    rating: 2198,
    totalScore: 300,
    totalTime: 110,
    penalty: 10,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 1, time: 10 },
      { order: 'B', status: 'solved', attempts: 2, time: 45 },
      { order: 'C', status: 'solved', attempts: 1, time: 55 },
      { order: 'D', status: 'none', attempts: 0, time: null },
    ],
    rankChange: 0,
  },
  {
    rank: 5,
    username: 'graph_theory',
    rating: 2156,
    totalScore: 200,
    totalTime: 45,
    penalty: 0,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 1, time: 12 },
      { order: 'B', status: 'solved', attempts: 1, time: 33 },
      { order: 'C', status: 'none', attempts: 0, time: null },
      { order: 'D', status: 'none', attempts: 0, time: null },
    ],
    rankChange: 3,
  },
  {
    rank: 6,
    username: 'dp_lover',
    rating: 2089,
    totalScore: 200,
    totalTime: 52,
    penalty: 10,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 2, time: 18 },
      { order: 'B', status: 'solved', attempts: 1, time: 34 },
      { order: 'C', status: 'failed', attempts: 2, time: null },
      { order: 'D', status: 'none', attempts: 0, time: null },
    ],
    rankChange: -2,
  },
  {
    rank: 7,
    username: 'stack_queue',
    rating: 2034,
    totalScore: 100,
    totalTime: 15,
    penalty: 0,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 1, time: 15 },
      { order: 'B', status: 'failed', attempts: 3, time: null },
      { order: 'C', status: 'none', attempts: 0, time: null },
      { order: 'D', status: 'none', attempts: 0, time: null },
    ],
    rankChange: 1,
  },
  {
    rank: 8,
    username: 'hash_map',
    rating: 1987,
    totalScore: 100,
    totalTime: 22,
    penalty: 10,
    problemResults: [
      { order: 'A', status: 'solved', attempts: 2, time: 22 },
      { order: 'B', status: 'failed', attempts: 1, time: null },
      { order: 'C', status: 'none', attempts: 0, time: null },
      { order: 'D', status: 'none', attempts: 0, time: null },
    ],
    rankChange: -1,
  },
];

export default function ContestDetail() {
  const { id: _id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'problems' | 'ranking'>('overview');
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour left
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Countdown timer
  useEffect(() => {
    if (mockContest.status !== 'running') return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatMinutes = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  return (
    <div className="contest-detail-page">
      <div className="container">
        {/* Header */}
        <div className="cd-header">
          <Link to="/contests" className="cd-back">
            <ChevronLeft size={18} />
            返回竞赛列表
          </Link>
        </div>

        {/* Contest Info */}
        <div className="cd-info">
          <div className="cd-info-left">
            <div className="cd-status">
              <span className={`status-dot status-dot--${mockContest.status}`} />
              {mockContest.status === 'running' ? '进行中' : mockContest.status === 'upcoming' ? '即将开始' : '已结束'}
            </div>
            <h1 className="cd-title">{mockContest.title}</h1>
            <p className="cd-desc">{mockContest.description}</p>
            <div className="cd-meta">
              <span className="cd-meta-item">
                <Calendar size={14} />
                {new Date(mockContest.startTime).toLocaleString('zh-CN')}
              </span>
              <span className="cd-meta-item">
                <Clock size={14} />
                时长 2 小时
              </span>
              <span className="cd-meta-item">
                <Target size={14} />
                {mockContest.problems.length} 道题目
              </span>
              <span className="cd-meta-item">
                <Users size={14} />
                {mockContest.participants.toLocaleString()} 人参赛
              </span>
            </div>
          </div>

          {/* Timer */}
          {mockContest.status === 'running' && (
            <div className="cd-timer">
              <div className="cd-timer-label">距离结束</div>
              <div className="cd-timer-value">{formatTime(timeLeft)}</div>
              <div className="cd-timer-bar">
                <div
                  className="cd-timer-fill"
                  style={{ width: `${(timeLeft / mockContest.duration) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="cd-tabs">
          <button
            className={`cd-tab ${activeTab === 'overview' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            概览
          </button>
          <button
            className={`cd-tab ${activeTab === 'problems' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            题目
          </button>
          <button
            className={`cd-tab ${activeTab === 'ranking' ? 'cd-tab--active' : ''}`}
            onClick={() => setActiveTab('ranking')}
          >
            排行榜
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="cd-content">
            <div className="cd-overview-grid">
              {/* Problem Overview */}
              <div className="cd-card">
                <h3 className="cd-card-title">
                  <Target size={18} />
                  题目概览
                </h3>
                <div className="cd-problem-list">
                  {mockContest.problems.map((p) => (
                    <div key={p.order} className="cd-problem-item">
                      <span className="cd-problem-order">{p.order}</span>
                      <div className="cd-problem-info">
                        <span className="cd-problem-name">{p.title}</span>
                        <span className={`difficulty-badge difficulty-badge--${p.difficulty}`}>
                          {p.difficulty === 'easy' ? '简单' : p.difficulty === 'medium' ? '中等' : '困难'}
                        </span>
                      </div>
                      <div className="cd-problem-stats">
                        <span className="cd-problem-solved">
                          <CheckCircle2 size={14} />
                          {p.solved}
                        </span>
                        <span className="cd-problem-rate">
                          {((p.solved / p.attempts) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 5 */}
              <div className="cd-card">
                <h3 className="cd-card-title">
                  <Trophy size={18} />
                  实时排名 Top 5
                </h3>
                <div className="cd-top-list">
                  {mockRanking.slice(0, 5).map((entry) => (
                    <div key={entry.rank} className="cd-top-item">
                      <div className={`cd-top-rank cd-top-rank--${entry.rank <= 3 ? entry.rank : 'other'}`}>
                        {entry.rank <= 3 ? <Medal size={16} /> : entry.rank}
                      </div>
                      <span className="cd-top-name">{entry.username}</span>
                      <span className="cd-top-score">{entry.totalScore}</span>
                      <span className="cd-top-time">{formatMinutes(entry.totalTime)}</span>
                    </div>
                  ))}
                </div>
                <button
                  className="cd-card-link"
                  onClick={() => setActiveTab('ranking')}
                >
                  查看完整排行榜 <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'problems' && (
          <div className="cd-content">
            <div className="cd-card">
              <h3 className="cd-card-title">
                <Target size={18} />
                竞赛题目
              </h3>
              <div className="cd-problem-table-wrapper">
                <table className="cd-problem-table">
                  <thead>
                    <tr>
                      <th>编号</th>
                      <th>题目</th>
                      <th>难度</th>
                      <th>通过率</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockContest.problems.map((p) => (
                      <tr key={p.order}>
                        <td className="cd-pt-order">{p.order}</td>
                        <td className="cd-pt-title">{p.title}</td>
                        <td>
                          <span className={`difficulty-badge difficulty-badge--${p.difficulty}`}>
                            {p.difficulty === 'easy' ? '简单' : p.difficulty === 'medium' ? '中等' : '困难'}
                          </span>
                        </td>
                        <td className="cd-pt-rate">
                          {p.solved}/{p.attempts} ({((p.solved / p.attempts) * 100).toFixed(0)}%)
                        </td>
                        <td>
                          <Link to={`/problems/${p.order}`} className="cd-pt-link">
                            <ExternalLink size={14} />
                            做题
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="cd-content">
            <div className="cd-card">
              <div className="cd-ranking-header">
                <h3 className="cd-card-title">
                  <Trophy size={18} />
                  实时排行榜
                </h3>
                <div className="cd-ranking-actions">
                  <span className="cd-refresh-time">
                    最后更新: {lastRefresh.toLocaleTimeString('zh-CN')}
                  </span>
                  <button className="cd-refresh-btn" onClick={handleRefresh}>
                    <RefreshCw size={14} />
                    刷新
                  </button>
                </div>
              </div>

              <div className="cd-ranking-wrapper">
                <table className="cd-ranking-table">
                  <thead>
                    <tr>
                      <th className="cd-rh-rank">排名</th>
                      <th className="cd-rh-user">选手</th>
                      <th className="cd-rh-score">总分</th>
                      <th className="cd-rh-time">用时</th>
                      {mockContest.problems.map((p) => (
                        <th key={p.order} className="cd-rh-problem">{p.order}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockRanking.map((entry) => (
                      <tr key={entry.rank} className="cd-rank-row">
                        <td className="cd-rd-rank">
                          <div className="cd-rank-badge-wrap">
                            <span className={`cd-rank-badge cd-rank-badge--${entry.rank <= 3 ? entry.rank : 'other'}`}>
                              {entry.rank}
                            </span>
                            {entry.rankChange > 0 && (
                              <span className="cd-rank-change cd-rank-change--up">
                                <ArrowUp size={10} /> {entry.rankChange}
                              </span>
                            )}
                            {entry.rankChange < 0 && (
                              <span className="cd-rank-change cd-rank-change--down">
                                <ArrowDown size={10} /> {Math.abs(entry.rankChange)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="cd-rd-user">
                          <span className="cd-rd-username">{entry.username}</span>
                          <span className="cd-rd-rating">{entry.rating}</span>
                        </td>
                        <td className="cd-rd-score">{entry.totalScore}</td>
                        <td className="cd-rd-time">{formatMinutes(entry.totalTime)}</td>
                        {entry.problemResults.map((pr) => (
                          <td key={pr.order} className="cd-rd-problem">
                            {pr.status === 'solved' && (
                              <div className="cd-pr-solved">
                                <CheckCircle2 size={14} />
                                <span className="cd-pr-time">{pr.time}m</span>
                                {pr.attempts > 1 && (
                                  <span className="cd-pr-attempts">(-{pr.attempts - 1})</span>
                                )}
                              </div>
                            )}
                            {pr.status === 'failed' && (
                              <div className="cd-pr-failed">
                                <XCircle size={14} />
                                <span className="cd-pr-attempts">(-{pr.attempts})</span>
                              </div>
                            )}
                            {pr.status === 'none' && (
                              <Minus size={14} className="cd-pr-none" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
