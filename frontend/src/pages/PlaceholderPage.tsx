import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

interface Props {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="container" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
    }}>
      <Construction size={64} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 16 }} />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>{title}</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: 16, marginBottom: 24, maxWidth: 400 }}>{description}</p>
      <Link to="/" style={{
        padding: '10px 24px', borderRadius: 'var(--radius-md)',
        background: 'var(--primary-600)', color: 'white', fontWeight: 600,
      }}>
        Back to Home
      </Link>
    </div>
  );
}
