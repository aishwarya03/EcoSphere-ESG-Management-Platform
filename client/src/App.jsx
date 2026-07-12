import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#131f38',
            color: '#f8fafc',
            border: '1px solid rgba(248,250,252,0.08)',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;
