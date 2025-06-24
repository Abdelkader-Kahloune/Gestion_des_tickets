import Login from './Login'
import Inscription from './Inscription'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import Dashboard from './dashboard/App'

const router = createBrowserRouter([
  {path:"/",element:<Login/>},
  {path:"/inscription",element:<Inscription/>},
  {path:"/dashboard",element:<Dashboard/>},
  //{path:"/user/:id",element:<User/>}//cosnt id = useParams(),
]);
function App(): React.JSX.Element {
  //const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
