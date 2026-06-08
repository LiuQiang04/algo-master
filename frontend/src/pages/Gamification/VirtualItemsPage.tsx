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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">虚拟商店</h1>
          <p className="mt-2 text-gray-600">
            使用积分兑换徽章、称号、头像框等虚拟物品，个性化你的主页！
          </p>
        </div>

        {/* 等级和积分信息 */}
        {levelInfo && (
          <div className="mb-8">
            <LevelProgress levelInfo={levelInfo} />
          </div>
        )}

        {/* 标签页 */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
            <p className="text-gray-500">暂无可兑换的物品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualItemsPage;
