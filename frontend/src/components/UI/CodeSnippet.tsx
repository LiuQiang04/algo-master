import { useState, useCallback, useEffect } from 'react';
import type { Language } from '@/types';
import { Save, Trash2, Download, Upload, Copy, Check, Code2 } from 'lucide-react';

const STORAGE_KEY = 'code-snippets';

export interface CodeSnippetData {
  id: string;
  name: string;
  description?: string;
  language: Language;
  code: string;
  createdAt: string;
  updatedAt: string;
}

interface SaveInput {
  name: string;
  description?: string;
  language: Language;
  code: string;
}

// ---- localStorage helpers ----

function loadAll(): CodeSnippetData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAll(snippets: CodeSnippetData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(snippets));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---- useCodeSnippets hook ----

export function useCodeSnippets() {
  const [snippets, setSnippets] = useState<CodeSnippetData[]>(loadAll);

  // Sync across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSnippets(loadAll());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const save = useCallback((input: SaveInput, existingId?: string): CodeSnippetData => {
    const now = new Date().toISOString();
    setSnippets((prev) => {
      let next: CodeSnippetData[];
      if (existingId) {
        next = prev.map((s) =>
          s.id === existingId
            ? { ...s, ...input, updatedAt: now }
            : s
        );
      } else {
        const snippet: CodeSnippetData = {
          id: generateId(),
          ...input,
          createdAt: now,
          updatedAt: now,
        };
        next = [snippet, ...prev];
      }
      saveAll(next);
      return next;
    });
    // Return the saved snippet (for convenience)
    const result: CodeSnippetData = {
      id: existingId || generateId(),
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    return result;
  }, []);

  const remove = useCallback((id: string) => {
    setSnippets((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveAll(next);
      return next;
    });
  }, []);

  const load = useCallback((id: string): CodeSnippetData | undefined => {
    return snippets.find((s) => s.id === id);
  }, [snippets]);

  const exportSnippets = useCallback((ids?: string[]): string => {
    const toExport = ids ? snippets.filter((s) => ids.includes(s.id)) : snippets;
    return JSON.stringify(toExport, null, 2);
  }, [snippets]);

  const importSnippets = useCallback((json: string): number => {
    try {
      const imported: CodeSnippetData[] = JSON.parse(json);
      if (!Array.isArray(imported)) return 0;
      const valid = imported.filter(
        (s) => s.name && s.language && s.code
      );
      if (valid.length === 0) return 0;
      setSnippets((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const now = new Date().toISOString();
        const deduped = valid.map((s) => ({
          ...s,
          id: existingIds.has(s.id) ? generateId() : s.id,
          createdAt: s.createdAt || now,
          updatedAt: s.updatedAt || now,
        }));
        const next = [...deduped, ...prev];
        saveAll(next);
        return next;
      });
      return valid.length;
    } catch {
      return 0;
    }
  }, []);

  const duplicate = useCallback((id: string): CodeSnippetData | undefined => {
    const original = snippets.find((s) => s.id === id);
    if (!original) return undefined;
    return save({
      name: `${original.name} (副本)`,
      description: original.description,
      language: original.language,
      code: original.code,
    });
  }, [snippets, save]);

  return {
    snippets,
    save,
    load,
    remove,
    duplicate,
    exportSnippets,
    importSnippets,
  };
}

// ---- Snippet Manager UI ----

interface SnippetManagerProps {
  language?: Language;
  onSelect?: (snippet: CodeSnippetData) => void;
  className?: string;
}

export function SnippetManager({ language, onSelect, className = '' }: SnippetManagerProps) {
  const { snippets, remove, exportSnippets, importSnippets } = useCodeSnippets();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = language
    ? snippets.filter((s) => s.language === language)
    : snippets;

  const handleCopy = async (snippet: CodeSnippetData) => {
    await navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const json = exportSnippets();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code-snippets.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const count = importSnippets(text);
      if (count > 0) {
        alert(`成功导入 ${count} 个代码片段`);
      } else {
        alert('导入失败：文件格式不正确');
      }
    };
    input.click();
  };

  if (filtered.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-8 text-[var(--text-muted)] ${className}`}>
        <Code2 size={32} className="mb-2" />
        <p className="text-sm">暂无保存的代码片段</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-[var(--text-muted)]">
          {filtered.length} 个片段
        </span>
        <div className="flex gap-1">
          <button
            onClick={handleImport}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
            title="导入"
          >
            <Upload size={14} />
          </button>
          <button
            onClick={handleExport}
            className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
            title="导出"
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto">
        {filtered.map((snippet) => (
          <div
            key={snippet.id}
            className="group flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--bg-secondary)] cursor-pointer"
            onClick={() => onSelect?.(snippet)}
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {snippet.name}
              </p>
              {snippet.description && (
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {snippet.description}
                </p>
              )}
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {snippet.language} · {new Date(snippet.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); handleCopy(snippet); }}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]"
                title="复制"
              >
                {copiedId === snippet.id ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); remove(snippet.id); }}
                className="p-1 rounded hover:bg-red-50 text-[var(--text-tertiary)] hover:text-red-500"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Save Snippet Dialog ----

interface SaveSnippetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: SaveInput) => void;
  defaultLanguage?: Language;
  defaultCode?: string;
}

export function SaveSnippetDialog({
  isOpen,
  onClose,
  onSave,
  defaultLanguage = 'cpp',
  defaultCode = '',
}: SaveSnippetDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || undefined, language, code: defaultCode });
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-light)] shadow-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">保存代码片段</h3>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：二分查找模板"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">描述</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="可选的描述信息"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">语言</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-light)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]"
            >
              <option value="cpp">C++</option>
              <option value="java">Java</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--primary-600)] text-white hover:bg-[var(--primary-700)] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Save size={14} />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

export default useCodeSnippets;
