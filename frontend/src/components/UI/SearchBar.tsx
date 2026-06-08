import { useState, useRef, useEffect, useCallback, type ChangeEvent, type KeyboardEvent } from 'react';
import { Search, X, Clock, ArrowRight, Trash2 } from 'lucide-react';
import { useKeyboardShortcuts, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import './SearchBar.css';

export type SearchCategory = 'problems' | 'users' | 'posts';

export interface SearchSuggestion {
  id: string | number;
  title: string;
  category: SearchCategory;
  subtitle?: string;
}

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string, category?: SearchCategory) => void;
  onSuggest?: (query: string) => Promise<SearchSuggestion[]>;
  categories?: SearchCategory[];
  className?: string;
  shortcutKey?: string;
}

const CATEGORY_LABELS: Record<SearchCategory, string> = {
  problems: '题目',
  users: '用户',
  posts: '帖子',
};

const STORAGE_KEY = 'search_history';
const MAX_HISTORY = 8;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
}

export default function SearchBar({
  placeholder = '搜索...',
  onSearch,
  onSuggest,
  categories,
  className = '',
  shortcutKey = 'ctrl+k',
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeCategory, setActiveCategory] = useState<SearchCategory | 'all'>(
    categories?.[0] || 'all'
  );
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 快捷键打开搜索
  useKeyboardShortcuts({
    [shortcutKey]: () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    'escape': () => {
      if (open) {
        setOpen(false);
        inputRef.current?.blur();
      }
    },
  });

  // 请求搜索建议
  useEffect(() => {
    if (!query.trim() || !onSuggest) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await onSuggest(query.trim());
        if (!cancelled) setSuggestions(results);
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, onSuggest]);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const addToHistory = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      const next = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, MAX_HISTORY);
      setHistory(next);
      saveHistory(next);
    },
    [history]
  );

  const removeHistoryItem = useCallback(
    (term: string) => {
      const next = history.filter((h) => h !== term);
      setHistory(next);
      saveHistory(next);
    },
    [history]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const handleSubmit = useCallback(
    (searchQuery?: string) => {
      const q = (searchQuery || query).trim();
      if (!q) return;
      addToHistory(q);
      onSearch(q, activeCategory === 'all' ? undefined : activeCategory);
      setOpen(false);
    },
    [query, activeCategory, addToHistory, onSearch]
  );

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    addToHistory(suggestion.title);
    onSearch(suggestion.title, suggestion.category);
    setOpen(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setActiveIndex(-1);
    if (!open) setOpen(true);
  };

  // 键盘导航
  const filteredSuggestions = suggestions.filter(
    (s) => activeCategory === 'all' || s.category === activeCategory
  );
  const historyItems = query
    ? []
    : history;
  const totalItems = filteredSuggestions.length + historyItems.length;

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[activeIndex]);
        } else if (
          activeIndex >= filteredSuggestions.length &&
          activeIndex < totalItems
        ) {
          const histIdx = activeIndex - filteredSuggestions.length;
          handleSubmit(historyItems[histIdx]);
        } else {
          handleSubmit();
        }
        break;
      case 'Tab':
        setOpen(false);
        break;
    }
  };

  return (
    <div className={`search-bar ${className}`}>
      {/* Trigger */}
      <button
        className="search-bar__trigger"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
      >
        <Search size={16} />
        <span className="search-bar__trigger-text">{placeholder}</span>
        <kbd className="search-bar__shortcut">{formatShortcut(shortcutKey)}</kbd>
      </button>

      {/* Overlay + Panel */}
      {open && (
        <div className="search-bar-overlay" onClick={() => setOpen(false)}>
          <div
            className="search-bar__panel"
            ref={panelRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="search-bar__input-wrap">
              <Search size={18} className="search-bar__input-icon" />
              <input
                ref={inputRef}
                type="text"
                className="search-bar__input"
                placeholder={placeholder}
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {query && (
                <button
                  className="search-bar__clear"
                  onClick={() => {
                    setQuery('');
                    setActiveIndex(-1);
                    inputRef.current?.focus();
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            {categories && categories.length > 1 && (
              <div className="search-bar__categories">
                <button
                  className={`search-bar__cat ${activeCategory === 'all' ? 'search-bar__cat--active' : ''}`}
                  onClick={() => setActiveCategory('all')}
                >
                  全部
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={`search-bar__cat ${activeCategory === cat ? 'search-bar__cat--active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            )}

            {/* Results */}
            <div className="search-bar__results">
              {/* Suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="search-bar__section">
                  <div className="search-bar__section-title">搜索建议</div>
                  {filteredSuggestions.map((item, idx) => (
                    <button
                      key={item.id}
                      className={`search-bar__item ${idx === activeIndex ? 'search-bar__item--active' : ''}`}
                      onClick={() => handleSuggestionClick(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className="search-bar__item-content">
                        <span
                          className="search-bar__item-title"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(item.title, query),
                          }}
                        />
                        {item.subtitle && (
                          <span className="search-bar__item-subtitle">{item.subtitle}</span>
                        )}
                      </div>
                      <span className="search-bar__item-cat">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* History */}
              {!query && historyItems.length > 0 && (
                <div className="search-bar__section">
                  <div className="search-bar__section-header">
                    <span className="search-bar__section-title">搜索历史</span>
                    <button className="search-bar__section-action" onClick={clearHistory}>
                      <Trash2 size={12} />
                      清除
                    </button>
                  </div>
                  {historyItems.map((term, idx) => {
                    const itemIdx = filteredSuggestions.length + idx;
                    return (
                      <button
                        key={term}
                        className={`search-bar__item ${itemIdx === activeIndex ? 'search-bar__item--active' : ''}`}
                        onClick={() => handleSubmit(term)}
                        onMouseEnter={() => setActiveIndex(itemIdx)}
                      >
                        <Clock size={14} className="search-bar__item-icon" />
                        <span className="search-bar__item-title">{term}</span>
                        <button
                          className="search-bar__item-remove"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeHistoryItem(term);
                          }}
                        >
                          <X size={12} />
                        </button>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty */}
              {query && filteredSuggestions.length === 0 && !loading && (
                <div className="search-bar__empty">
                  <p>没有找到相关结果</p>
                  <button className="search-bar__submit-btn" onClick={() => handleSubmit()}>
                    搜索 "{query}"
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="search-bar__loading">
                  <div className="search-bar__loading-spinner" />
                  <span>搜索中...</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="search-bar__footer">
              <span>
                <kbd>Enter</kbd> 搜索
              </span>
              <span>
                <kbd>&uarr;</kbd><kbd>&darr;</kbd> 导航
              </span>
              <span>
                <kbd>Esc</kbd> 关闭
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
