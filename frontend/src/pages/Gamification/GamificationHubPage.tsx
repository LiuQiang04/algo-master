import React from 'react';
import { Link } from 'react-router-dom';
import { useGamificationOverview } from '../../hooks/useGamification';
import {
  Award, BarChart3, CalendarCheck, Coins, Gift,
  ChevronRight, Trophy, Flame, Sparkles,
} from 'lucide-react';

const hubCards = [
  {
    to: '/achievements',
    icon: Award,
    title: '成就',
    color: 'from-amber-400 to-orange-500',
    bgLight: 'bg-amber-50',
    getDesc: (data: any) => `${data.achievementCount ?? '--'} 个已解锁`,
  },
  {
    to: '/leaderboard',
    icon: BarChart3,
    title: '排行榜',
    color: 'from-blue-400 to-indigo-500',
    bgLight: 'bg-blue-50',
    getDesc: (data: any) => data.globalRank ? `全球排名 #${data.globalRank}` : '暂无排名',
  },
  {
    to: '/daily-challenge',
    icon: CalendarCheck,
    title: '每日挑战',
    color: 'from-emerald-400 to-teal-500',
    bgLight: 'bg-emerald-50',
    getDesc: (data: any) => `已完成 ${data.completedDailyChallenges ?? 0} 次`,
  },
  {
    to: '/points',
    icon: Coins,
    title: '积分',
    color: 'from-purple-400 to-violet-500',
    bgLight: 'bg-purple-50',
    getDesc: (data: any) => `${data.totalExp ?? '--'} 总经验`,
  },
  {
    to: '/virtual-items',
    icon: Gift,
    title: '虚拟道具',
    color: 'from-pink-400 to-rose-500',
    bgLight: 'bg-pink-50',
    getDesc: () => '徽章 / 称号 / 头像框',
  },
];

const GamificationHubPage: React.FC = () => {
  const { overview, loading } = useGamificationOverview();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 px-6 py-10 lg:px-16 lg:py-16">
      {/* 页面标题 */}
      <div className="max-w-5xl mx-auto mb-12">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles size={28} className="text-indigo-500" />
          <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            游戏化中心
          </h1>
        </div>
        <p className="text-lg text-gray-500 ml-1">
          追踪你的学习成就，与全球用户一较高下
        </p>
      </div>

      {/* 登录连续天数横幅 */}
      {overview && (
        <div className="max-w-5xl mx-auto mb-10">
          <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3">
                <Flame size={24} className="text-orange-500" />
                <span className="text-sm text-gray-500">连续登录</span>
                <span className="text-2xl font-bold text-orange-600">{overview.loginStreak}</span>
                <span className="text-sm text-gray-400">天</span>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="flex items-center gap-3">
                <Trophy size={24} className="text-amber-500" />
                <span className="text-sm text-gray-500">等级</span>
                <span className="text-2xl font-bold text-gray-800">Lv.{overview.level}</span>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden sm:block" />
              <div className="flex-1 min-w-[120px]">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>经验值</span>
                  <span>{overview.currentExp} / {overview.nextLevelExp}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${overview.progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="max-w-5xl mx-auto flex justify-center py-20">
          <div className="animate-spin rounded-full w-12 h-12 border-b-2 border-indigo-500" />
        </div>
      )}

      {/* 5 个模块卡片 */}
      {!loading && (
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="group bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-sm`}>
                  <card.icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {card.getDesc(overview ?? {})}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-indigo-500 group-hover:gap-2 transition-all">
                查看详情 <ChevronRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GamificationHubPage;
