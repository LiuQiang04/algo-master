import { RouterProvider } from 'react-router-dom';
import { router } from '@/routes';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/UI/Toast';
import { useToast } from '@/hooks/useToast';

function AppInner() {
  const { toasts, removeToast, position } = useToast();

  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer toasts={toasts} onClose={removeToast} position={position} />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}

export default App;
