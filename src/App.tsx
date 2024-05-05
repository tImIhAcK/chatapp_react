import { MainWrapper, PrivateRoute } from "./layouts";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import {
  Login,
  Register,
  Logout,
  Activate,
  Chat,
  Conversations,
} from "./pages";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => (
  <BrowserRouter>
    <MainWrapper>
      <Routes>
        <Route
          path=""
          element={
            <PrivateRoute>
              <Conversations />
            </PrivateRoute>
          }
        />
        <Route
          path="chats/:conversationName"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/logout"
          element={
            <PrivateRoute>
              <Logout />
            </PrivateRoute>
          }
        />
        <Route path="/activate" element={<Activate />} />
      </Routes>
    </MainWrapper>
    <ToastContainer />
  </BrowserRouter>
);

export default App;
