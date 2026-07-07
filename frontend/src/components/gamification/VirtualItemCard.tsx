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

const rarityGradients: Record<string, string> = {
  common: 'linear-gradient(135deg, #9CA3AF, #6B7280)',
  rare: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
  epic: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
  legendary: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
};

const rarityBorders: Record<string, string> = {
  common: 'var(--border-light)',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FBBF24',
};

const rarityLabels: Record<string, string> = {
  common: '普通', rare: '稀有', epic: '史诗', legendary: '传说',
};

const typeLabels: Record<string, string> = {
  badge: '徽章', title: '称号', frame: '头像框', decoration: '装饰',
};

const VirtualItemCard: React.FC<VirtualItemCardProps> = ({ item, isOwned = false, isEquipped = false, onPurchase, onEquip, userPoints = 0 }) => {
  const isUserItem = 'acquiredAt' in item;
  const virtualItem = isUserItem ? (item as UserVirtualItem).item : item;
  const rarity = virtualItem.rarity || 'common';
  const canAfford = userPoints >= virtualItem.price;

  return (
    <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: `1px solid ${isOwned || isUserItem ? rarityBorders[rarity] : 'rgba(255,255,255,0.3)'}`, borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.6)', color: 'var(--text-muted)', border: '1px solid rgba(255,255,255,0.4)' }}>{typeLabels[virtualItem.type]}</span>
        <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.6)', color: rarity === 'legendary' ? '#D97706' : rarity === 'epic' ? '#7C3AED' : rarity === 'rare' ? '#3B82F6' : 'var(--text-muted)' }}>{rarityLabels[rarity]}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
        <div style={{ width: 80, height: 80, borderRadius: 'var(--radius-md)', background: rarityGradients[rarity], display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {virtualItem.iconUrl ? <img src={virtualItem.iconUrl} alt={virtualItem.name} style={{ width: 56, height: 56 }} /> : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          )}
        </div>
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center', margin: 0 }}>{virtualItem.name}</h3>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center', margin: '4px 0 0', lineHeight: 1.4 }}>{virtualItem.description}</p>
      <div style={{ marginTop: 20 }}>
        {isOwned || isUserItem ? (
          isEquipped ? (
            <button onClick={() => onEquip?.(virtualItem.id, false)} style={{ width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 500, background: 'rgba(255,255,255,0.6)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>卸下</button>
          ) : (
            <button onClick={() => onEquip?.(virtualItem.id, true)} style={{ width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 500, background: '#4F46E5', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>装备</button>
          )
        ) : virtualItem.price === 0 ? (
          <button onClick={() => onPurchase?.(virtualItem.id)} style={{ width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 500, background: '#059669', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>免费领取</button>
        ) : (
          <button onClick={() => onPurchase?.(virtualItem.id)} disabled={!canAfford} style={{ width: '100%', padding: '10px 0', fontSize: 14, fontWeight: 500, borderRadius: 'var(--radius-md)', border: 'none', cursor: canAfford ? 'pointer' : 'not-allowed', background: canAfford ? '#D97706' : 'rgba(255,255,255,0.3)', color: canAfford ? 'white' : 'var(--text-muted)' }}>{virtualItem.price} 积分{!canAfford && ' (不足)'}</button>
        )}
      </div>
    </div>
  );
};

export default VirtualItemCard;
