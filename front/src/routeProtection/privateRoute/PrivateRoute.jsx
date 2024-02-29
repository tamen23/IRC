import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../store/auth/AuthContext'; // Assurez-vous que le chemin est correct

const PrivateRoute = ({ component: Component }) => {
    const { isAuth, userRole, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    return isAuth && userRole === 'admin' ? <Component /> : <Navigate to="/not-found" />;
};

export default PrivateRoute;