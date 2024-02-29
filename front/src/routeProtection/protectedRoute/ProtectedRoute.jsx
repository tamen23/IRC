import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/auth/AuthContext'; // Assurez-vous que le chemin est correct


const ProtectedRoute = ({ component: Component }) => {
    const { isAuth, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    return isAuth ? <Component /> : <Navigate to="/not-found" />;
};

export default ProtectedRoute;