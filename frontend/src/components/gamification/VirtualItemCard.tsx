import React from 'react';
import type { VirtualItem, UserVirtualItem } from '../../types/gamification';

interface VirtualItemCardProps {
  item: VirtualItem | UserVirtualItem;
  isOwned?: boolean;
  isEquipped?: boolean;
  onPurchase?: (itemId: string) => void;
  onEquip?: (itemId: string, equip: boolean) => void;
  userPoints?: number;
}

const rarityColors: Record<string, string> = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const rarityBorders: Record<string, string> = {
  common: 'border-gray-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const rarityLabels: Record<string, string> = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const typeLabels: Record<string, string> = {
  badge: '徽章',
  title: '称号',
  frame: '头像框',
  decoration: '装饰',
};

const VirtualItemCard: React.FC<VirtualItemCardProps> = ({
  item,
  isOwned = false,
  isEquipped = false,
  onPurchase,
  onEquip,
  userPoints = 0,
}) => {
  const isUserItem = 'acquiredAt' in item;
  const virtualItem = isUserItem ? (item as UserVirtualItem).item : item;
  const rarity = virtualItem.rarity || 'common';
  const canAfford = userPoints >= virtualItem.price;

  return (
    <div
      className={`backdrop-blur-xl bg-white/70 border rounded-2xl p-7 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isOwned || isUserItem
          ? rarityBorders[rarity] + ' shadow-lg shadow-purple-500/5'
          : 'border-white/30'
      }`}
    >
      {/* 类型 + 稀有度标签行 */}
      <div className="flex justify-between items-start mb-4">
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-white/60 backdrop-blur-sm text-gray-500 border border-white/40">
          {typeLabels[virtualItem.type]}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm bg-white/80 border border-white/60 shadow-sm ${
          rarity === 'legendary' ? 'text-amber-600' :
          rarity === 'epic' ? 'text-purple-600' :
          rarity === 'rare' ? 'text-blue-600' :
          'text-gray-500'
        }`}>
          {rarityLabels[rarity]}
        </span>
      </div>

      {/* 图标 - 更大尺寸，渐变 + 光泽 */}
      <div className="flex justify-center mb-4">
        <div className={`w-24 h-24 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg ${rarityColors[rarity]}`}>
          {virtualItem.iconUrl ? (
            <img src={virtualItem.iconUrl} alt={virtualItem.name} className="w-16 h-16 drop-shadow" />
          ) : (
            <svg className="w-12 h-12 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
        </div>
      </div>

      {/* 名称 + 描述 */}
      <h3 className="text-lg font-bold text-gray-800 text-center truncate">{virtualItem.name}</h3>
      <p className="text-sm text-gray-500 text-center mt-1 leading-relaxed line-clamp-2">{virtualItem.description}</p>

      {/* 操作按钮 - 玻璃风格 */}
      <div className="mt-5">
        {isOwned || isUserItem ? (
          isEquipped ? (
            <button onClick={() => onEquip?.(virtualItem.id, false)}
              className="w-full py-3.5 bg-white/60 backdrop-blur-sm text-gray-600 rounded-xl text-base font-medium border border-white/40 hover:bg-white/80 transition-all">
              卸下
            </button>
          ) : (
            <button onClick={() => onEquip?.(virtualItem.id, true)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-base font-medium shadow-lg shadow-purple-500/20 hover:shadow-xl transition-all">
              装备
            </button>
          )
        ) : virtualItem.price === 0 ? (
          <button onClick={() => onPurchase?.(virtualItem.id)}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-base font-medium shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all">
            免费领取
          </button>
        ) : (
          <button onClick={() => onPurchase?.(virtualItem.id)} disabled={!canAfford}
            className={`w-full py-3.5 rounded-xl text-base font-medium transition-all ${
              canAfford
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl'
                : 'bg-white/30 backdrop-blur-sm text-gray-400 border border-white/30 cursor-not-allowed'
            }`}>
            {virtualItem.price} 积分{!canAfford && ' (不足)'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VirtualItemCard;
