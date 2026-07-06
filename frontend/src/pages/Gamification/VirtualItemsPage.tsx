import React, { useState } from 'react';
import { useVirtualItems, useUserVirtualItems, useLevelInfo } from '../../hooks/useGamification';
import VirtualItemCard from '../../components/gamification/VirtualItemCard';
import LevelProgress from '../../components/gamification/LevelProgress';

const VirtualItemsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'badge' | 'title' | 'frame' | 'decoration'>('badge');
  const { items, loading: itemsLoading } = useVirtualItems(activeTab);
  const { userItems, purchaseItem, equipItem, loading: userItemsLoading } = useUserVirtualItems();
  const { levelInfo } = useLevelInfo();

  const tabs = [
    { id: 'badge' as const, label: '徽章', icon: '🏅' },
    { id: 'title' as const, label: '称号', icon: '👑' },
    { id: 'frame' as const, label: '头像框', icon: '🖼️' },
    { id: 'decoration' as const, label: '装饰', icon: '✨' },
  ];

  const ownedItemIds = new Set(userItems.map((ui) => ui.itemId));
  const equippedItemIds = new Set(
    userItems.filter((ui) => ui.isEquipped).map((ui) => ui.itemId)
  );

  const handlePurchase = async (itemId: string) => {
    try {
      await purchaseItem(itemId);
      alert('购买成功！');
    } catch (err: any) {
      alert(err.message || '购买失败');
    }
  };

  const handleEquip = async (itemId: string, equip: boolean) => {
    try {
      await equipItem(itemId, equip);
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const isLoading = itemsLoading || userItemsLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50/80 to-pink-50 w-full px-6 lg:px-12 py-8 lg:py-12">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          虚拟商店
        </h1>
        <p className="mt-2 text-gray-500">
          使用积分兑换徽章、称号、头像框等虚拟物品，个性化你的主页！
        </p>
      </div>

      {/* 等级和积分信息 */}
      {levelInfo && (
        <div className="mb-8">
          <LevelProgress levelInfo={levelInfo} />
        </div>
      )}

      {/* 标签页 - 玻璃容器 */}
      <div className="flex gap-1 backdrop-blur-xl bg-white/60 border border-white/40 rounded-xl p-1.5 mb-8 shadow-lg shadow-purple-500/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/40'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 物品列表 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-8 shadow-lg shadow-purple-500/5 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-400 border-t-transparent"></div>
            <span className="text-sm text-gray-400">加载中...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {items.map((item) => (
            <VirtualItemCard
              key={item.id}
              item={item}
              isOwned={ownedItemIds.has(item.id)}
              isEquipped={equippedItemIds.has(item.id)}
              onPurchase={handlePurchase}
              onEquip={handleEquip}
              userPoints={levelInfo?.totalExp || 0}
            />
          ))}
        </div>
      )}

      {items.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="backdrop-blur-xl bg-white/70 border border-white/40 rounded-2xl p-10 shadow-lg shadow-purple-500/5 inline-block">
            <p className="text-gray-400">暂无可兑换的物品</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualItemsPage;
