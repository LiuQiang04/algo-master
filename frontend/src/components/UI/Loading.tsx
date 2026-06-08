interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export default function Loading({ size = 'md', className = '' }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizeStyles[size]}
          border-4 border-gray-200 border-t-blue-600
          rounded-full animate-spin
        `}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loading size="lg" />
    </div>
  );
}
