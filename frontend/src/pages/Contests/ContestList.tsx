import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  Search,
  Zap,
  Star,
} from 'lucide-react';
import './ContestList.css';

interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  duration: string;
  status: 'upcoming' | 'running' | 'ended';
  participants: number;
  maxParticipants: number | null;
  problems: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isOfficial: boolean;
}

const mockContests: Contest[] = [
  {
    id: 1,
    title: '周赛 #128',
    description: '本周算法周赛，涵盖数组、字符串、动态规划等经典题目。',
    startTime: '2026-06-08T20:00:00',
    endTime: '2026-06-08T22:00:00',
    duration: '2 小时',
    status: 'upcoming',
    participants: 1234,
    maxParticipants: 5000,
    problems: 4,
    difficulty: 'intermediate',
    isOfficial: true,
  },
  {
    id: 2,
    title: '月度挑战赛 - 六月',
    description: '每月一次的大型挑战赛，高难度题目等你来战。',
    startTime: '2026-06-15T14:00:00',
    endTime: '2026-06-15T17:00:00',
    duration: '3 小时',
    status: 'upcoming',
    participants: 5678,
    maxParticipants: 10000,
    problems: 6,
    difficulty: 'advanced',
    isOfficial: true,
  },
  {
    id: 3,
    title: '新手入门赛 #45',
    description: '专为初学者设计的入门竞赛，帮助你熟悉竞赛环境。',
    startTime: '2026-06-07T19:00:00',
    endTime: '2026-06-07T20:30:00',
    duration: '1.5 小时',
    status: 'running',
    participants: 892,
    maxParticipants: 2000,
    problems: 3,
    difficulty: 'beginner',
    isOfficial: true,
  },
  {
    id: 4,
    title: '数据结构专题赛',
    description: '专注数据结构的专题竞赛，包括树、图、堆等。',
    startTime: '2026-06-01T10:00:00',
    endTime: '2026-06-01T13:00:00',
    duration: '3 小时',
    status: 'ended',
    participants: 2345,
    maxParticipants: null,
    problems: 5,
    difficulty: 'intermediate',
    isOfficial: false,
  },
  {
    id: 5,
    title: '算法马拉松',
    description: '24 小时马拉松式竞赛，考验你的耐力和算法能力。',
    startTime: '2026-05-24T00:00:00',
    endTime: '2026-05-25T00:00:00',
    duration: '24 小时',
    status: 'ended',
    participants: 4567,
    maxParticipants: null,
    problems: 12,
    difficulty: 'advanced',
    isOfficial: true,
  },
  {
    id: 6,
    title: '企业杯编程大赛',
    description: '与知名企业合作举办的编程大赛，优秀选手可获得实习机会。',
    startTime: '2026-06-20T09:00:00',
    endTime: '2026-06-20T12:00:00',
    duration: '3 小时',
    status: 'upcoming',
    participants: 3210,
    maxParticipants: 5000,
    problems: 5,
    difficulty: 'advanced',
    isOfficial: true,
  },
];

const difficultyLabels = {
  beginner: '入门',
  intermediate: '进阶',
  advanced: '高级',
};

const statusLabels = {
  upcoming: '即将开始',
  running: '进行中',
  ended: '已结束',
};

export default function ContestList() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContests = mockContests.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="contest-list-page">
      <div className="container">
        {/* Page Header */}
        <div className="cl-header">
          <div>
            <h1 className="cl-title">竞赛中心</h1>
            <p className="cl-desc">参加算法竞赛，检验你的实力，提升排名</p>
          </div>
        </div>

        {/* Filters */}
        <div className="cl-filters">
          <div className="cl-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="搜索竞赛..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="cl-filter-chips">
            <button
              className={`cl-chip ${statusFilter === 'all' ? 'cl-chip--active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              全部
            </button>
            <button
              className={`cl-chip ${statusFilter === 'upcoming' ? 'cl-chip--active' : ''}`}
              onClick={() => setStatusFilter('upcoming')}
            >
              即将开始
            </button>
            <button
              className={`cl-chip ${statusFilter === 'running' ? 'cl-chip--active cl-chip--running' : ''}`}
              onClick={() => setStatusFilter('running')}
            >
              <Zap size={14} />
              进行中
            </button>
            <button
              className={`cl-chip ${statusFilter === 'ended' ? 'cl-chip--active' : ''}`}
              onClick={() => setStatusFilter('ended')}
            >
              已结束
            </button>
          </div>
        </div>

        {/* Contest Grid */}
        <div className="cl-grid">
          {filteredContests.map((contest) => (
            <Link
              key={contest.id}
              to={`/contests/${contest.id}`}
              className={`contest-card contest-card--${contest.status}`}
            >
              {contest.isOfficial && (
                <div className="contest-card__official">
                  <Star size={12} />
                  官方
                </div>
              )}
              <div className="contest-card__header">
                <div className="contest-card__status">
                  <span className={`status-dot status-dot--${contest.status}`} />
                  {statusLabels[contest.status]}
                </div>
                <span className={`contest-diff contest-diff--${contest.difficulty}`}>
                  {difficultyLabels[contest.difficulty]}
                </span>
              </div>
              <h3 className="contest-card__title">{contest.title}</h3>
              <p className="contest-card__desc">{contest.description}</p>
              <div className="contest-card__info">
                <div className="contest-card__detail">
                  <Calendar size={14} />
                  <span>{formatDate(contest.startTime)}</span>
                </div>
                <div className="contest-card__detail">
                  <Clock size={14} />
                  <span>{contest.duration}</span>
                </div>
                <div className="contest-card__detail">
                  <Trophy size={14} />
                  <span>{contest.problems} 道题目</span>
                </div>
                <div className="contest-card__detail">
                  <Users size={14} />
                  <span>
                    {contest.participants.toLocaleString()}
                    {contest.maxParticipants && ` / ${contest.maxParticipants.toLocaleString()}`} 人
                  </span>
                </div>
              </div>
              {contest.status === 'upcoming' && (
                <button className="contest-card__btn">立即报名</button>
              )}
              {contest.status === 'running' && (
                <button className="contest-card__btn contest-card__btn--running">
                  <Zap size={16} />
                  进入竞赛
                </button>
              )}
              {contest.status === 'ended' && (
                <button className="contest-card__btn contest-card__btn--ended">
                  查看结果
                </button>
              )}
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredContests.length === 0 && (
          <div className="cl-empty">
            <Trophy size={48} />
            <h3>没有找到匹配的竞赛</h3>
            <p>尝试调整筛选条件</p>
          </div>
        )}
      </div>
    </div>
  );
}
