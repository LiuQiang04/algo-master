import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  content: string;
}

export default function MarkdownRenderer({ content }: Props) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeString = String(children).replace(/\n$/, '');
          if (match) {
            return <CodeBlock language={match[1]} code={codeString} />;
          }
          return (
            <code style={{
              background: 'var(--bg-tertiary)', padding: '2px 6px',
              borderRadius: 'var(--radius-sm)', fontSize: '0.9em',
              fontFamily: 'var(--font-mono)',
            }} {...props}>
              {children}
            </code>
          );
        },
        table({ children }) {
          return (
            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>{children}</table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th style={{
              border: '1px solid var(--border-light)', padding: '8px 12px',
              background: 'var(--bg-secondary)', fontWeight: 600, textAlign: 'left',
            }}>{children}</th>
          );
        },
        td({ children }) {
          return (
            <td style={{
              border: '1px solid var(--border-light)', padding: '8px 12px',
            }}>{children}</td>
          );
        },
        a({ href, children }) {
          return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
        },
        blockquote({ children }) {
          return (
            <blockquote style={{
              borderLeft: '4px solid var(--primary-400)', paddingLeft: 16,
              margin: '16px 0', color: 'var(--text-secondary)',
              background: 'var(--bg-secondary)', padding: '12px 16px',
              borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            }}>{children}</blockquote>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'relative', margin: '16px 0', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#1e1e2e', padding: '8px 16px', fontSize: 12, color: '#888',
      }}>
        <span>{language}</span>
        <button onClick={handleCopy} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          color: copied ? 'var(--success-500)' : '#888', fontSize: 12,
        }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 14 }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
