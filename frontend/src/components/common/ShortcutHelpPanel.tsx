import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';
import { useKeyboardShortcuts, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import './ShortcutHelpPanel.css';

export interface ShortcutItem {
  key: string;
  description: string;
}

interface ShortcutHelpPanelProps {
  shortcuts: ShortcutItem[];
  triggerKey?: string;
}

/**
 * 快捷键帮助面板。
 * 按 triggerKey（默认 Ctrl+/）打开/关闭面板，展示所有注册的快捷键。
 */
export default function ShortcutHelpPanel({
  shortcuts,
  triggerKey = 'ctrl+/',
}: ShortcutHelpPanelProps) {
  const [open, setOpen] = useState(false);

  useKeyboardShortcuts({
    [triggerKey]: () => setOpen((prev) => !prev),
    'escape': () => setOpen(false),
  });

  if (!open) return null;

  return (
    <div className="shortcut-panel-overlay" onClick={() => setOpen(false)}>
      <div className="shortcut-panel" onClick={(e) => e.stopPropagation()}>
        <div className="shortcut-panel__header">
          <div className="shortcut-panel__title">
            <Keyboard size={18} />
            键盘快捷键
          </div>
          <button className="shortcut-panel__close" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <div className="shortcut-panel__body">
          {shortcuts.map((item) => (
            <div key={item.key} className="shortcut-panel__row">
              <span className="shortcut-panel__desc">{item.description}</span>
              <kbd className="shortcut-panel__kbd">{formatShortcut(item.key)}</kbd>
            </div>
          ))}
        </div>
        <div className="shortcut-panel__footer">
          按 <kbd>{formatShortcut(triggerKey)}</kbd> 打开此面板
        </div>
      </div>
    </div>
  );
}
