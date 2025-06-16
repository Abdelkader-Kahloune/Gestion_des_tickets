import Login from './Login'
import Inscription from './Inscription'

function App(): React.JSX.Element {
  //const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      {/* <Login /> */}
      <Inscription />
    </>
  )
}

export default App
