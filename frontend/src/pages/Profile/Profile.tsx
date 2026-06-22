import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Calendar,
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
  X,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { getUserProfile, updateProfile, type UserProfileData, type UpdateProfileData } from '@/services/users';
import { getSubmissions } from '@/services/submissions';
import { achievementApi } from '@/api/gamification';
import type { Submission, PaginatedData } from '@/types';
import './Profile.css';

const statusLabels: Record<string, { text: string; class: string }> = {
  accepted: { text: '通过', class: 'accepted' },
  wrong_answer: { text: '错误', class: 'wrong' },
  time_limit_exceeded: { text: '超时', class: 'timeout' },
  runtime_error: { text: '运行错误', class: 'error' },
  compile_error: { text: '编译错误', class: 'error' },
  pending: { text: '等待中', class: 'timeout' },
  judging: { text: '评测中', class: 'timeout' },
  memory_limit_exceeded: { text: '内存超限', class: 'timeout' },
};

const achievementMeta: Record<string, { icon: typeof Star; color: string }> = {
  solve_1: { icon: Star, color: 'amber' },
  solve_100: { icon: Target, color: 'blue' },
  streak_7: { icon: Flame, color: 'orange' },
  contest_10: { icon: Trophy, color: 'purple' },
  hard_50: { icon: Shield, color: 'red' },
  speed_5min: { icon: Zap, color: 'cyan' },
  all_types: { icon: Award, color: 'gold' },
  rating_2400: { icon: Star, color: 'diamond' },
};

function getAchievementMeta(category: string, index: number) {
  const fallbackIcons = [Star, Target, Flame, Trophy, Shield, Zap, Award, Star];
  const fallbackColors = ['amber', 'blue', 'orange', 'purple', 'red', 'cyan', 'gold', 'diamond'];
  return achievementMeta[category] || {
    icon: fallbackIcons[index % fallbackIcons.length],
    color: fallbackColors[index % fallbackColors.length],
  };
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 2) return '昨天';
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString('zh-CN');
}

export default function Profile() {
  const [activeTab, setActiveTab] = useState<'overview' | 'submissions' | 'achievements'>('overview');
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { user: authUser, updateUser } = useAuthStore();
  const userId = authUser?.id;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const profileData = await getUserProfile(userId);
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load submissions and achievements independently (non-blocking)
  useEffect(() => {
    if (!userId) return;
    getSubmissions({ page: 1, pageSize: 20 })
      .then((data) => setSubmissions(data.items || []))
      .catch(() => {});
    achievementApi.getMy()
      .then((res: any) => setAchievements(res.data.data || []))
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOpenEdit = () => {
    if (profile) {
      setEditForm({ username: profile.username, bio: profile.bio || '' });
    }
    setSaveError(null);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      const data: UpdateProfileData = {};
      if (editForm.username !== profile?.username) data.username = editForm.username;
      if (editForm.bio !== (profile?.bio || '')) data.bio = editForm.bio;
      const updated = await updateProfile(data);
      setProfile((prev) => prev ? { ...prev, ...updated } : prev);
      updateUser({ username: updated.username, bio: updated.bio || undefined });
      setShowEditModal(false);
    } catch (err: any) {
      setSaveError(err.response?.data?.message || err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary-500)' }} />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="profile-page">
        <div className="container" style={{ textAlign: 'center', padding: '120px 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{error || '无法加载用户信息'}</p>
          <button className="profile-edit-btn" style={{ marginTop: 16 }} onClick={fetchProfile}>
            重试
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.username;
  const joinDate = profile.createdAt;
  const stats = {
    posts: profile._count?.posts || 0,
    followers: profile._count?.followers || 0,
    following: profile._count?.following || 0,
    comments: profile._count?.comments || 0,
  };

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
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <User size={40} />
              )}
            </div>
            <div className="profile-details">
              <div className="profile-name-row">
                <h1 className="profile-name">{displayName}</h1>
                <span className="profile-level">Lv.{profile.level}</span>
                <button className="profile-edit-btn" onClick={handleOpenEdit}>
                  <Edit3 size={14} />
                  编辑资料
                </button>
              </div>
              <p className="profile-username">@{profile.username}</p>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}
              <div className="profile-meta">
                <span className="profile-meta-item">
                  <Mail size={14} />
                  {authUser?.email}
                </span>
                <span className="profile-meta-item">
                  <Calendar size={14} />
                  {new Date(joinDate).toLocaleDateString('zh-CN')} 加入
                </span>
              </div>
            </div>
            <div className="profile-rating-card">
              <div className="profile-rating-value">{profile.rating}</div>
              <div className="profile-rating-label">竞赛 Rating</div>
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
              <div className="profile-stat-value">{stats.posts}</div>
              <div className="profile-stat-label">发帖数</div>
            </div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon profile-stat-icon--green">
              <CheckCircle2 size={20} />
            </div>
            <div className="profile-stat-content">
              <div className="profile-stat-value">{stats.followers}</div>
              <div className="profile-stat-label">粉丝</div>
            </div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon profile-stat-icon--orange">
              <Flame size={20} />
            </div>
            <div className="profile-stat-content">
              <div className="profile-stat-value">{stats.following}</div>
              <div className="profile-stat-label">关注</div>
            </div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-icon profile-stat-icon--purple">
              <Trophy size={20} />
            </div>
            <div className="profile-stat-content">
              <div className="profile-stat-value">{stats.comments}</div>
              <div className="profile-stat-label">评论数</div>
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
                      <span>Lv.{profile.level}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (profile.level % 10) * 10)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Achievements Preview */}
                <div className="profile-card">
                  <div className="profile-card-header">
                    <h3 className="profile-card-title">
                      <Award size={18} />
                      成就
                    </h3>
                    <button className="profile-card-link" onClick={() => setActiveTab('achievements')}>
                      查看全部 <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="achievement-mini-list">
                    {achievements.slice(0, 4).map((ach: any, i: number) => {
                      const meta = getAchievementMeta(ach.category || ach.achievement?.category || '', i);
                      const Icon = meta.icon;
                      return (
                        <div key={ach.id || i} className={`achievement-mini achievement-mini--${meta.color}`}>
                          <div className="achievement-mini-icon">
                            <Icon size={20} />
                          </div>
                          <div className="achievement-mini-info">
                            <span className="achievement-mini-name">{ach.name || ach.achievement?.name || '成就'}</span>
                            <span className="achievement-mini-desc">{ach.description || ach.achievement?.description || ''}</span>
                          </div>
                        </div>
                      );
                    })}
                    {achievements.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 12 }}>
                        暂无成就
                      </p>
                    )}
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
                    {submissions.slice(0, 5).map((sub) => {
                      const statusInfo = statusLabels[sub.status] || { text: sub.status, class: 'timeout' };
                      return (
                        <div key={sub.id} className="submission-item">
                          <div className="submission-left">
                            <span className={`submission-status submission-status--${statusInfo.class}`}>
                              {statusInfo.text}
                            </span>
                            <span className="submission-problem">#{sub.problemId}</span>
                          </div>
                          <div className="submission-right">
                            <span className="submission-lang">{sub.language}</span>
                            <span className="submission-time">{relativeTime(sub.submittedAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                    {submissions.length === 0 && (
                      <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: 12 }}>
                        暂无提交记录
                      </p>
                    )}
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
                      <th>题目 ID</th>
                      <th>状态</th>
                      <th>语言</th>
                      <th>运行时间</th>
                      <th>提交时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub) => {
                      const statusInfo = statusLabels[sub.status] || { text: sub.status, class: 'timeout' };
                      return (
                        <tr key={sub.id}>
                          <td className="submission-problem-cell">#{sub.problemId}</td>
                          <td>
                            <span className={`submission-status submission-status--${statusInfo.class}`}>
                              {statusInfo.text}
                            </span>
                          </td>
                          <td>{sub.language}</td>
                          <td className="submission-runtime">
                            {sub.executionTime != null ? `${sub.executionTime}ms` : '-'}
                          </td>
                          <td className="submission-time-cell">{relativeTime(sub.submittedAt)}</td>
                        </tr>
                      );
                    })}
                    {submissions.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                          暂无提交记录
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="profile-content">
            <div className="achievements-grid">
              {achievements.map((ach: any, i: number) => {
                const meta = getAchievementMeta(ach.category || ach.achievement?.category || '', i);
                const Icon = meta.icon;
                return (
                  <div
                    key={ach.id || i}
                    className={`achievement-card achievement-card--unlocked achievement-card--${meta.color}`}
                  >
                    <div className="achievement-card-icon">
                      <Icon size={28} />
                    </div>
                    <h4 className="achievement-card-name">{ach.name || ach.achievement?.name || '成就'}</h4>
                    <p className="achievement-card-desc">{ach.description || ach.achievement?.description || ''}</p>
                  </div>
                );
              })}
              {achievements.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                  暂无成就徽章
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">编辑资料</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">用户名</label>
                <input
                  type="text"
                  className="form-input"
                  value={editForm.username}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                  maxLength={50}
                />
              </div>
              <div className="form-group">
                <label className="form-label">个人简介</label>
                <textarea
                  className="form-textarea"
                  value={editForm.bio}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                  maxLength={500}
                  rows={4}
                  placeholder="介绍一下自己..."
                />
              </div>
              {saveError && (
                <p className="form-error">{saveError}</p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowEditModal(false)}>取消</button>
              <button className="btn-save" onClick={handleSaveProfile} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
