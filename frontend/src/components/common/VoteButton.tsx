import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface Props {
  upvotes: number;
  downvotes: number;
  userVote: number; // 1, -1, or 0
  onVote: (value: number) => Promise<void>;
  vertical?: boolean;
}

export default function VoteButton({ upvotes, downvotes, userVote, onVote, vertical = true }: Props) {
  const [voting, setVoting] = useState(false);
  const score = upvotes - downvotes;

  const handleVote = async (value: number) => {
    if (voting) return;
    setVoting(true);
    try {
      await onVote(value);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: vertical ? 'column' : 'row',
      alignItems: 'center', gap: 2,
    }}>
      <button
        onClick={() => handleVote(1)}
        disabled={voting}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          color: userVote === 1 ? 'var(--primary-600)' : 'var(--text-muted)',
          background: userVote === 1 ? 'var(--primary-50)' : 'transparent',
          transition: 'var(--transition-fast)',
        }}
      >
        <ChevronUp size={20} />
      </button>
      <span style={{
        fontSize: 14, fontWeight: 700, minWidth: 24, textAlign: 'center',
        color: score > 0 ? 'var(--success-600)' : score < 0 ? 'var(--danger-600)' : 'var(--text-secondary)',
      }}>
        {score}
      </span>
      <button
        onClick={() => handleVote(-1)}
        disabled={voting}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 32, height: 32, borderRadius: 'var(--radius-md)',
          color: userVote === -1 ? 'var(--danger-600)' : 'var(--text-muted)',
          background: userVote === -1 ? 'var(--danger-50)' : 'transparent',
          transition: 'var(--transition-fast)',
        }}
      >
        <ChevronDown size={20} />
      </button>
    </div>
  );
}
