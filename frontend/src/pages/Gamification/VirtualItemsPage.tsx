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
  const equippedItemIds = new Set(userItems.filter((ui) => ui.isEquipped).map((ui) => ui.itemId));

  const handlePurchase = async (itemId: string) => {
    try { await purchaseItem(itemId); alert('购买成功！'); }
    catch (err: any) { alert(err.message || '购买失败'); }
  };

  const handleEquip = async (itemId: string, equip: boolean) => {
    try { await equipItem(itemId, equip); }
    catch (err: any) { alert(err.message || '操作失败'); }
  };

  const isLoading = itemsLoading || userItemsLoading;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '32px 0' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>虚拟商店</h1>
          <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>使用积分兑换徽章、称号、头像框等虚拟物品，个性化你的主页！</p>
        </div>

        {levelInfo && (
          <div style={{ marginBottom: 24 }}><LevelProgress levelInfo={levelInfo} size="lg" /></div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '12px 16px', border: 'none', borderRadius: 'var(--radius-md)', fontSize: 14,
              fontWeight: 500, cursor: 'pointer',
              background: activeTab === tab.id ? '#4F46E5' : 'rgba(255,255,255,0.6)',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(124,58,237,0.2)' : 'none',
            }}>
              <span>{tab.icon}</span><span>{tab.label}</span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <div data-testid="loading-spinner" style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border-light)', borderTopColor: 'var(--primary-600)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
            {items.map((item) => (
              <VirtualItemCard key={item.id} item={item} isOwned={ownedItemIds.has(item.id)} isEquipped={equippedItemIds.has(item.id)} onPurchase={handlePurchase} onEquip={handleEquip} userPoints={levelInfo?.totalExp || 0} />
            ))}
          </div>
        )}

        {items.length === 0 && !isLoading && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>暂无可兑换的物品</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualItemsPage;
