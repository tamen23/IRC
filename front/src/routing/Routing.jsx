import { useAuth, AuthProvider } from "../store/auth/AuthContext";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../routeProtection/protectedRoute/ProtectedRoute";
import Login from "../views/global/login/Login";
import Infos from "../views/global/infos/Infos";
import Sidebar from "../views/global/sidebar/Sidebar";
import Header from "../views/global/header/Header";
import AddFriends from "../views/global/addFriends/AddFriends";
import Home from "../views/global/home/Home";
import Friends from "../views/global/friends/Friends";
import CreateServer from "../views/global/createServer/CreateServer";
import PrivateRoom from "../views/global/rooms/private/PrivateRoom";
import ChannelRoom from "../views/global/rooms/channel/ChannelRoom";
import Server from "../views/global/rooms/server/Server";
import ChannelsList from "../views/global/channelList/ChannelList";
import FindChannel from "../views/global/findChannel/FindChannel";

const RoutingComponent = () => {
  const { isAuth, userRole, logout, userId } = useAuth();
  return (
    <>
      {isAuth && userRole === "user" && <Sidebar />}
      {isAuth && <Header />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/infos" element={<ProtectedRoute component={Infos} />} />
        <Route
          path="/add-friends"
          element={<ProtectedRoute component={AddFriends} />}
        />
        <Route
          path="/friends"
          element={<ProtectedRoute component={Friends} />}
        />
        <Route
          path="/create-server"
          element={<ProtectedRoute component={CreateServer} />}
        />
        <Route
          path="/my-channels"
          element={<ProtectedRoute component={ChannelsList} />}
        />
        <Route
          path="/private/:id"
          element={<ProtectedRoute component={PrivateRoom} />}
        />
        <Route
          path="/channel/:id"
          element={<ProtectedRoute component={ChannelRoom} />}
        />
        <Route
          path="/server/:id"
          element={<ProtectedRoute component={Server} />}
        />
        <Route
          path="/find-channels"
          element={<ProtectedRoute component={FindChannel} />}
        />
      </Routes>
    </>
  );
};

export default RoutingComponent;
