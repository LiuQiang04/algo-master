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

const rarityColors = {
  common: 'from-gray-400 to-gray-500',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const rarityBorders = {
  common: 'border-gray-300',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400',
};

const rarityLabels = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const typeLabels = {
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
      className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all hover:shadow-lg ${
        isOwned || isUserItem ? rarityBorders[rarity] : 'border-gray-200'
      }`}
    >
      {/* 稀有度和类型标签 */}
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-gray-500">{typeLabels[virtualItem.type]}</span>
        <span
          className={`px-2 py-1 rounded text-xs text-white bg-gradient-to-r ${rarityColors[rarity]}`}
        >
          {rarityLabels[rarity]}
        </span>
      </div>

      {/* 图标 */}
      <div className="flex justify-center mb-3">
        <div
          className={`w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br ${rarityColors[rarity]}`}
        >
          {virtualItem.iconUrl ? (
            <img
              src={virtualItem.iconUrl}
              alt={virtualItem.name}
              className="w-12 h-12"
            />
          ) : (
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* 名称和描述 */}
      <h3 className="font-semibold text-gray-800 text-center">{virtualItem.name}</h3>
      <p className="text-xs text-gray-500 text-center mt-1">{virtualItem.description}</p>

      {/* 操作按钮 */}
      <div className="mt-4">
        {isOwned || isUserItem ? (
          isEquipped ? (
            <button
              onClick={() => onEquip?.(virtualItem.id, false)}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
            >
              卸下
            </button>
          ) : (
            <button
              onClick={() => onEquip?.(virtualItem.id, true)}
              className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              装备
            </button>
          )
        ) : virtualItem.price === 0 ? (
          <button
            onClick={() => onPurchase?.(virtualItem.id)}
            className="w-full py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
          >
            免费领取
          </button>
        ) : (
          <button
            onClick={() => onPurchase?.(virtualItem.id)}
            disabled={!canAfford}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
              canAfford
                ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {virtualItem.price} 积分
            {!canAfford && ' (不足)'}
          </button>
        )}
      </div>
    </div>
  );
};

export default VirtualItemCard;
