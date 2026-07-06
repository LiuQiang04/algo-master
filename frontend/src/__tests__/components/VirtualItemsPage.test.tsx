import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VirtualItemsPage from '../../pages/Gamification/VirtualItemsPage';

const mockUseVirtualItems = jest.fn();
const mockUseUserVirtualItems = jest.fn();
const mockUseLevelInfo = jest.fn();

jest.mock('../../hooks/useGamification', () => ({
  useVirtualItems: (...args: any[]) => mockUseVirtualItems(...args),
  useUserVirtualItems: (...args: any[]) => mockUseUserVirtualItems(...args),
  useLevelInfo: (...args: any[]) => mockUseLevelInfo(...args),
}));

jest.mock('../../components/gamification/VirtualItemCard', () => ({
  __esModule: true,
  default: ({ item, isOwned, isEquipped, onPurchase, onEquip, userPoints }: any) => (
    <div data-testid="virtual-item-card" data-owned={isOwned} data-equipped={isEquipped}>
      <div>{item.name}</div>
      <div>{item.price} 积分</div>
      <button onClick={() => onPurchase?.(item.id)} data-testid={`buy-${item.id}`}>
        {isOwned ? '已拥有' : (userPoints >= item.price ? '购买' : '积分不足')}
      </button>
      {isOwned && (
        <button onClick={() => onEquip?.(item.id, !isEquipped)} data-testid={`equip-${item.id}`}>
          {isEquipped ? '卸下' : '装备'}
        </button>
      )}
    </div>
  ),
}));

jest.mock('../../components/gamification/LevelProgress', () => ({
  __esModule: true,
  default: ({ levelInfo }: any) => <div data-testid="level-progress">Level {levelInfo.level}</div>,
}));

const mockBadgeItems = [
  { id: 'b1', name: 'Gold Badge', type: 'badge' as const, rarity: 'rare' as const, description: 'Shiny', iconUrl: null, price: 500, isActive: true },
  { id: 'b2', name: 'Silver Badge', type: 'badge' as const, rarity: 'common' as const, description: 'Nice', iconUrl: null, price: 200, isActive: true },
];

const mockTitleItems = [
  { id: 't1', name: 'Grandmaster', type: 'title' as const, rarity: 'legendary' as const, description: 'Top', iconUrl: null, price: 5000, isActive: true },
];

const mockFrameItems = [
  { id: 'f1', name: 'Gold Frame', type: 'frame' as const, rarity: 'epic' as const, description: 'Shiny frame', iconUrl: null, price: 1000, isActive: true },
];

const mockDecorationItems = [
  { id: 'd1', name: 'Sparkle', type: 'decoration' as const, rarity: 'common' as const, description: 'Sparkles', iconUrl: null, price: 100, isActive: true },
];

describe('VirtualItemsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPage = () => render(<VirtualItemsPage />, { wrapper: BrowserRouter });

  it('renders page title', () => {
    mockUseVirtualItems.mockReturnValue({ items: [], loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    expect(screen.getByText('虚拟商店')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    mockUseVirtualItems.mockReturnValue({ items: [], loading: true });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: true, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    const spinners = document.querySelectorAll('.animate-spin');
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it('renders level info when available', () => {
    mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: { level: 10, currentExp: 500, nextLevelExp: 1000, progress: 50, totalExp: 5000 } });

    renderPage();
    expect(screen.getByTestId('level-progress')).toBeInTheDocument();
  });

  it('renders items in "badge" tab by default', () => {
    mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    expect(screen.getByText('Gold Badge')).toBeInTheDocument();
    expect(screen.getByText('Silver Badge')).toBeInTheDocument();
  });

  it('switches tabs and renders different item types', () => {
    mockUseVirtualItems.mockReturnValue({ items: mockBadgeItems, loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();

    // Switch to 称号 tab
    mockUseVirtualItems.mockReturnValue({ items: mockTitleItems, loading: false });
    fireEvent.click(screen.getByText('称号'));
    expect(screen.getByText('Grandmaster')).toBeInTheDocument();

    // Switch to 头像框 tab
    mockUseVirtualItems.mockReturnValue({ items: mockFrameItems, loading: false });
    fireEvent.click(screen.getByText('头像框'));
    expect(screen.getByText('Gold Frame')).toBeInTheDocument();

    // Switch to 装饰 tab
    mockUseVirtualItems.mockReturnValue({ items: mockDecorationItems, loading: false });
    fireEvent.click(screen.getByText('装饰'));
    expect(screen.getByText('Sparkle')).toBeInTheDocument();
  });

  it('shows empty state when no items', () => {
    mockUseVirtualItems.mockReturnValue({ items: [], loading: false });
    mockUseUserVirtualItems.mockReturnValue({ userItems: [], loading: false, purchaseItem: jest.fn(), equipItem: jest.fn() });
    mockUseLevelInfo.mockReturnValue({ levelInfo: null });

    renderPage();
    expect(screen.getByText('暂无可兑换的物品')).toBeInTheDocument();
  });
});
