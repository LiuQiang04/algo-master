import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Clock,
  Users,
  Calendar,
  Search,
  Zap,
  Star,
  Loader2,
} from 'lucide-react';
import { contestService } from '@/services';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import type { Contest } from '@/types';
import './ContestList.css';

const difficultyLabels: Record<string, string> = {
  rated: 'Rated',
  unrated: 'Unrated',
};

const statusLabels = {
  upcoming: '即将开始',
  running: '进行中',
  ended: '已结束',
};

export default function ContestList() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const { success, error: showError } = useToast();
  const { isAuthenticated } = useAuth();

  const fetchContests = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: 1, pageSize: 50 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const data = await contestService.getContests(params as any);
      setContests(data.items);
    } catch {
      showError('加载竞赛列表失败');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showError]);

  useEffect(() => {
    fetchContests();
  }, [fetchContests]);

  const handleJoin = async (e: React.MouseEvent, contestId: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showError('请先登录再报名竞赛');
      return;
    }

    setJoiningId(contestId);
    try {
      await contestService.joinContest(contestId);
      success('报名成功！');
      fetchContests();
    } catch (err: any) {
      const msg = err?.response?.data?.message || '报名失败，请稍后重试';
      showError(msg);
    } finally {
      setJoiningId(null);
    }
  };

  const filteredContests = contests.filter((c) => {
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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

  const getDuration = (start: string, end: string) => {
    const ms = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0 && minutes > 0) return `${hours} 小时 ${minutes} 分钟`;
    if (hours > 0) return `${hours} 小时`;
    return `${minutes} 分钟`;
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

        {/* Loading State */}
        {loading && (
          <div className="cl-loading">
            <Loader2 size={32} className="cl-loading-spinner" />
            <p>加载中...</p>
          </div>
        )}

        {/* Contest Grid */}
        {!loading && (
          <div className="cl-grid">
            {filteredContests.map((contest) => (
              <Link
                key={contest.id}
                to={`/contests/${contest.id}`}
                className={`contest-card contest-card--${contest.status}`}
              >
                {contest.type === 'rated' && (
                  <div className="contest-card__official">
                    <Star size={12} />
                    Rated
                  </div>
                )}
                <div className="contest-card__header">
                  <div className="contest-card__status">
                    <span className={`status-dot status-dot--${contest.status}`} />
                    {statusLabels[contest.status]}
                  </div>
                  <span className={`contest-diff contest-diff--${contest.type}`}>
                    {difficultyLabels[contest.type] || contest.type}
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
                    <span>{getDuration(contest.startTime, contest.endTime)}</span>
                  </div>
                  <div className="contest-card__detail">
                    <Trophy size={14} />
                    <span>{contest.problemCount} 道题目</span>
                  </div>
                  <div className="contest-card__detail">
                    <Users size={14} />
                    <span>{contest.participantCount.toLocaleString()} 人</span>
                  </div>
                </div>
                {contest.status === 'upcoming' && (
                  <button
                    className="contest-card__btn"
                    onClick={(e) => handleJoin(e, contest.id)}
                    disabled={joiningId === contest.id}
                  >
                    {joiningId === contest.id ? (
                      <Loader2 size={16} className="cl-loading-spinner" />
                    ) : (
                      '立即报名'
                    )}
                  </button>
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
        )}

        {/* Empty State */}
        {!loading && filteredContests.length === 0 && (
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
