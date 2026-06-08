import { useEffect, useRef, useCallback } from 'react';

export type ShortcutHandler = (event: KeyboardEvent) => void;

export interface ShortcutEntry {
  key: string;
  handler: ShortcutHandler;
  description?: string;
}

// 全局快捷键注册表，用于冲突检测
const globalRegistry = new Map<string, string>();

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .split('+')
    .map((k) => k.trim())
    .sort()
    .join('+');
}

function parseEvent(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey || event.metaKey) parts.push('ctrl');
  if (event.shiftKey) parts.push('shift');
  if (event.altKey) parts.push('alt');

  const key = event.key.toLowerCase();
  // 排除单独的修饰键
  if (['control', 'meta', 'shift', 'alt'].includes(key)) return '';
  parts.push(key);

  return parts.sort().join('+');
}

function isInputFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return (
    tag === 'input' ||
    tag === 'textarea' ||
    tag === 'select' ||
    (el as HTMLElement).isContentEditable
  );
}

/**
 * 注册全局键盘快捷键。
 * 当焦点在输入框内时，快捷键自动禁用（除非快捷键包含 ctrl/meta 修饰键）。
 *
 * @param shortcuts - 快捷键映射，键为快捷键组合字符串（如 'ctrl+k'），值为回调函数
 * @param options - 可选配置
 * @param options.enabled - 是否启用快捷键，默认 true
 * @param options.componentId - 组件标识，用于冲突检测
 *
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+k': () => openSearch(),
 *   'ctrl+shift+p': () => openCommandPalette(),
 *   'escape': () => closeModal(),
 * });
 */
export function useKeyboardShortcuts(
  shortcuts: Record<string, ShortcutHandler>,
  options: { enabled?: boolean; componentId?: string } = {}
): void {
  const { enabled = true, componentId = 'anonymous' } = options;
  const handlersRef = useRef<Map<string, ShortcutHandler>>(new Map());

  // 构建规范化映射
  useEffect(() => {
    const map = new Map<string, ShortcutHandler>();
    for (const [key, handler] of Object.entries(shortcuts)) {
      const normalized = normalizeKey(key);
      map.set(normalized, handler);

      // 冲突检测
      if (import.meta.env.DEV) {
        const existing = globalRegistry.get(normalized);
        if (existing && existing !== componentId) {
          console.warn(
            `[useKeyboardShortcuts] Shortcut "${key}" already registered by "${existing}", now overridden by "${componentId}".`
          );
        }
      }
      globalRegistry.set(normalized, componentId);
    }
    handlersRef.current = map;

    // 清理注册
    return () => {
      for (const [normalized] of map) {
        const current = globalRegistry.get(normalized);
        if (current === componentId) {
          globalRegistry.delete(normalized);
        }
      }
    };
  }, [shortcuts, componentId]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const combo = parseEvent(event);
      if (!combo) return;

      const handler = handlersRef.current.get(combo);
      if (!handler) return;

      // 非修饰键组合时，如果焦点在输入框内则跳过
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
      if (!hasModifier && isInputFocused()) return;

      event.preventDefault();
      event.stopPropagation();
      handler(event);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}

/**
 * 获取当前已注册的所有快捷键（用于帮助面板展示）。
 */
export function getRegisteredShortcuts(): string[] {
  return Array.from(globalRegistry.keys());
}

/**
 * 格式化快捷键组合为可读字符串。
 */
export function formatShortcut(key: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  return key
    .split('+')
    .map((k) => {
      switch (k) {
        case 'ctrl':
          return isMac ? '⌘' : 'Ctrl';
        case 'shift':
          return isMac ? '⇧' : 'Shift';
        case 'alt':
          return isMac ? '⌥' : 'Alt';
        case 'escape':
          return 'Esc';
        case ' ':
          return 'Space';
        case 'enter':
          return 'Enter';
        case 'arrowup':
          return '↑';
        case 'arrowdown':
          return '↓';
        case 'arrowleft':
          return '←';
        case 'arrowright':
          return '→';
        default:
          return k.length === 1 ? k.toUpperCase() : k;
      }
    })
    .join(isMac ? '' : '+');
}
