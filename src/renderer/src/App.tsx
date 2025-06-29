import Login from "./Login";
import Inscription from "./Inscription";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./dashboard/App";
import MyProfile from "./user/MyProfile";
import MyTicket from "./user/MyTicket";
import RestorePassword from "./RestorePassword";

const router = createBrowserRouter([
  { path: "*", element: <Login /> },
  { path: "/inscription", element: <Inscription /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/user/:id", element: <MyProfile /> },
  { path: "/ticket/:id", element: <MyTicket /> },
  { path: "mot_de_passe_oublié", element: <RestorePassword /> },
  //{path:"/user/:id",element:<User/>}//cosnt id = useParams(),
]);
function App(): React.JSX.Element {
  //const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
