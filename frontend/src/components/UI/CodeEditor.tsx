import { useRef, useCallback, useEffect } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

type Language = 'cpp' | 'python' | 'java' | 'javascript';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: Language;
  fontSize?: number;
  onSubmit?: () => void;
  readOnly?: boolean;
}

const languageMap: Record<Language, string> = {
  cpp: 'cpp',
  python: 'python',
  java: 'java',
  javascript: 'javascript',
};

function detectTheme(): 'vs-dark' | 'vs' {
  if (typeof window === 'undefined') return 'vs-dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'vs-dark' : 'vs';
}

export default function CodeEditor({
  value,
  onChange,
  language,
  fontSize = 14,
  onSubmit,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const themeRef = useRef<'vs-dark' | 'vs'>(detectTheme());

  const handleMount: OnMount = useCallback(
    (editorInstance, monaco) => {
      editorRef.current = editorInstance;

      // Register Ctrl+Enter submit action
      if (onSubmit) {
        editorInstance.addAction({
          id: 'submit-code',
          label: '提交代码',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
          run: () => onSubmit(),
        });
      }

      // Focus editor on mount
      editorInstance.focus();
    },
    [onSubmit],
  );

  const handleChange: OnChange = useCallback(
    (newValue) => {
      onChange(newValue ?? '');
    },
    [onChange],
  );

  // Listen for system theme changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      themeRef.current = e.matches ? 'vs-dark' : 'vs';
      // Monaco doesn't support dynamic theme switching without re-render,
      // but the editor instance respects the theme prop on next render.
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <Editor
        height="100%"
        language={languageMap[language]}
        value={value}
        theme={themeRef.current}
        onChange={handleChange}
        onMount={handleMount}
        options={{
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          wordWrap: 'off',
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          bracketPairColorization: { enabled: true },
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'advanced',
          formatOnPaste: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          readOnly,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          folding: true,
          links: true,
        }}
      />
    </div>
  );
}
