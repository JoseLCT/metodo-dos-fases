import './App.css'
import MainTable from './components/MainTable'

function App() {

  return (
    <main className='flex flex-col w-screen min-h-screen items-center pt-52'>
      <h1 className='font-bold text-3xl text-center mt-10 mb-10'>Método de las dos fases</h1>
      <MainTable />
    </main>
  )
}

export default App
