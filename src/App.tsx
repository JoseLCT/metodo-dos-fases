import './App.css'
import { useState } from 'react';
import { Table } from './models/table';
import MainTable from './components/MainTable'
import { agregarVariablesArtificiales, verificacionUltimaColumna } from './functions/all';

function App() {
  const [init, setInit] = useState<boolean>(false);

  const actualizarTabla = (newTable: Table) => {
    let copyTable = { ...newTable };
    verificacionUltimaColumna(copyTable);
    console.log(copyTable);
    agregarVariablesArtificiales(copyTable);
    console.log(copyTable);
  }

  return (
    <main className='flex flex-col w-screen min-h-screen items-center pt-28'>
      <h1 className='font-bold text-3xl text-center mt-10 mb-10'>Método de las dos fases</h1>
      <MainTable setTable={actualizarTabla} />
    </main>
  )
}

export default App
