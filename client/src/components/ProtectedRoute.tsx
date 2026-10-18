import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  roles?: string[];
};

export function ProtectedRoute({ roles }: Props) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-neutral-500">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ loginRequired: true }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
