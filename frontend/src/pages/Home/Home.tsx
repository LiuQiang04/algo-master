import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Code2,
  Trophy,
  BookOpen,
  Users,
  Zap,
  Target,
  TrendingUp,
  ChevronRight,
  Play,
  Star,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { getPopularProblems, getUpcomingContests } from '@/services/home';
import { formatNumber } from '@/utils/format';
import type { ProblemListItem, Contest } from '@/types';
import './Home.css';

const features = [
  {
    icon: Code2,
    title: '丰富的题库',
    desc: '涵盖数据结构、算法、数学等多个领域的 1000+ 精选题目，从入门到进阶全覆盖。',
    color: 'blue',
  },
  {
    icon: Zap,
    title: '即时评测',
    desc: '支持 C++、Java、Python 等多语言在线评测，毫秒级返回结果，实时反馈。',
    color: 'amber',
  },
  {
    icon: Trophy,
    title: '竞赛系统',
    desc: '定期举办算法竞赛，实时排行榜，与全球选手同台竞技，提升实战能力。',
    color: 'purple',
  },
  {
    icon: BookOpen,
    title: '学习路径',
    desc: '系统化的学习路径规划，从基础算法到高级数据结构，循序渐进掌握核心知识。',
    color: 'green',
  },
  {
    icon: TrendingUp,
    title: '进度追踪',
    desc: '详细的学习数据分析，可视化你的成长轨迹，精准定位薄弱环节。',
    color: 'rose',
  },
  {
    icon: Users,
    title: '社区交流',
    desc: '活跃的开发者社区，题解分享、讨论交流，与志同道合的伙伴共同进步。',
    color: 'cyan',
  },
];

const stats = [
  { value: '1,200+', label: '精选题目', icon: Target },
  { value: '50,000+', label: '活跃用户', icon: Users },
  { value: '2,000,000+', label: '代码提交', icon: Code2 },
  { value: '300+', label: '竞赛举办', icon: Trophy },
];

/** 将 ISO 时间字符串格式化为中文友好的相对/绝对时间 */
function formatContestTime(isoStr: string): string {
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return date.toLocaleDateString('zh-CN');
  if (diffHours < 24) return `${diffHours} 小时后`;

  const diffDays = Math.round(diffHours / 24);
  if (diffDays <= 7) return `${diffDays} 天后`;

  return date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/** 计算竞赛时长（小时） */
function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.round(ms / (1000 * 60 * 60));
  if (hours < 1) {
    const minutes = Math.round(ms / (1000 * 60));
    return `${minutes}分钟`;
  }
  return `${hours}小时`;
}

export default function Home() {
  const [problems, setProblems] = useState<ProblemListItem[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [problemsLoading, setProblemsLoading] = useState(true);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [problemsError, setProblemsError] = useState<string | null>(null);
  const [contestsError, setContestsError] = useState<string | null>(null);
  const difficultyMap: Record<number, string> = { 1: 'easy', 2: 'easy', 3: 'medium', 4: 'hard', 5: 'hard' };

  useEffect(() => {
    getPopularProblems(4)
      .then(setProblems)
      .catch(() => setProblemsError('加载题目失败'))
      .finally(() => setProblemsLoading(false));

    getUpcomingContests(2)
      .then(setContests)
      .catch(() => setContestsError('加载竞赛失败'))
      .finally(() => setContestsLoading(false));
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__gradient" />
          <div className="hero__grid" />
        </div>
        <div className="hero__content container">
          <div className="hero__badge">
            <Star size={14} />
            <span>算法竞赛学习平台</span>
          </div>
          <h1 className="hero__title">
            掌握算法
            <br />
            <span className="hero__title-accent">成就竞赛梦想</span>
          </h1>
          <p className="hero__desc">
            从基础数据结构到高级算法，系统化的学习路径帮助你全面提升编程能力。
            与全球开发者同台竞技，在实战中成长。
          </p>
          <div className="hero__actions">
            <Link to="/problems" className="hero__btn hero__btn--primary">
              <Play size={18} />
              开始练习
            </Link>
            <Link to="/paths" className="hero__btn hero__btn--secondary">
              学习路径
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="hero__stats">
            {stats.map((stat) => (
              <div key={stat.label} className="hero__stat">
                <stat.icon size={20} />
                <span className="hero__stat-value">{stat.value}</span>
                <span className="hero__stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">为什么选择 Algorithm Arena</h2>
            <p className="section-desc">
              我们提供全方位的算法学习体验，帮助你在竞赛中脱颖而出
            </p>
          </div>
          <div className="features__grid">
            {features.map((feature) => (
              <div key={feature.title} className={`feature-card feature-card--${feature.color}`}>
                <div className="feature-card__icon">
                  <feature.icon size={24} />
                </div>
                <h3 className="feature-card__title">{feature.title}</h3>
                <p className="feature-card__desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Problems Section */}
      <section className="recent-problems">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">热门题目</h2>
              <p className="section-desc">最近大家都在练习的题目</p>
            </div>
            <Link to="/problems" className="section-link">
              查看全部 <ChevronRight size={16} />
            </Link>
          </div>
          <div className="problems-list">
            {problemsLoading ? (
              <div className="home-loading">加载中...</div>
            ) : problemsError ? (
              <div className="home-error">{problemsError}</div>
            ) : (
              problems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/problems/${problem.id}`}
                  className="problem-row"
                >
                  <div className="problem-row__left">
                    <span className="problem-row__id">#{problem.id}</span>
                    <span className="problem-row__title">{problem.title}</span>
                  </div>
                  <div className="problem-row__right">
                    <div className="problem-row__tags">
                      {problem.tags.map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    {(() => {
                      const diffKey = typeof problem.difficulty === 'number'
                        ? difficultyMap[problem.difficulty] || 'medium'
                        : problem.difficulty;
                      return (
                        <span className={`difficulty difficulty--${diffKey}`}>
                          {diffKey === 'easy' ? '简单' : diffKey === 'medium' ? '中等' : '困难'}
                        </span>
                      );
                    })()}
                    <span className="problem-row__solves">
                      <CheckCircle2 size={14} />
                      {formatNumber(problem.solvedCount)}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Contests Section */}
      <section className="upcoming-contests">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">即将开始的竞赛</h2>
              <p className="section-desc">报名参加竞赛，检验你的实力</p>
            </div>
            <Link to="/contests" className="section-link">
              查看全部 <ChevronRight size={16} />
            </Link>
          </div>
          <div className="contests-grid">
            {contestsLoading ? (
              <div className="home-loading">加载中...</div>
            ) : contestsError ? (
              <div className="home-error">{contestsError}</div>
            ) : (
              contests.map((contest) => (
                <div key={contest.id} className="contest-card">
                  <div className="contest-card__header">
                    <Trophy size={20} />
                    <h3 className="contest-card__title">{contest.title}</h3>
                  </div>
                  <div className="contest-card__info">
                    <div className="contest-card__detail">
                      <Clock size={16} />
                      <span>{formatContestTime(contest.startTime)}</span>
                    </div>
                    <div className="contest-card__detail">
                      <Target size={16} />
                      <span>时长 {formatDuration(contest.startTime, contest.endTime)}</span>
                    </div>
                    <div className="contest-card__detail">
                      <Users size={16} />
                      <span>{formatNumber(contest.participantCount)} 人已报名</span>
                    </div>
                  </div>
                  <button className="contest-card__btn">立即报名</button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta__content">
            <h2 className="cta__title">准备好开始了吗？</h2>
            <p className="cta__desc">
              加入 Algorithm Arena，开启你的算法学习之旅。免费注册，立即开始练习。
            </p>
            <Link to="/register" className="cta__btn">
              免费注册
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
