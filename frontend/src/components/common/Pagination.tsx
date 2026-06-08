import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 24 }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          opacity: page <= 1 ? 0.5 : 1,
        }}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) =>
        typeof p === 'string' ? (
          <span key={`dots-${i}`} style={{ padding: '0 8px', color: 'var(--text-muted)' }}>...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              fontSize: 14, fontWeight: p === page ? 600 : 400,
              color: p === page ? 'white' : 'var(--text-primary)',
              background: p === page ? 'var(--primary-600)' : 'transparent',
              border: p === page ? 'none' : '1px solid var(--border-light)',
            }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 'var(--radius-md)',
          color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
          border: '1px solid var(--border-light)',
          opacity: page >= totalPages ? 0.5 : 1,
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
