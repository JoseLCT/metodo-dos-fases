import './App.css'
import { useState } from 'react';
import { Table } from './models/table';
import MainTable from './components/MainTable'
import { agregarVariablesArtificiales, convertirCeldaEn1, convertirColumnaUnidad, convertirEnColumnaUnidad, generarMatriz, hayPositivosEnZ, obtenerIndicePivote, obtenerMasPositivo, validarColumnaUnidadR, validarValorR, verificacionUltimaColumna } from './functions/all';

function App() {
  const [init, setInit] = useState<boolean>(false);

  const actualizarTabla = (newTable: Table) => {
    verificacionUltimaColumna(newTable);
    agregarVariablesArtificiales(newTable);
    const { matrix, primeraFila } = generarMatriz(newTable);
    const indicesColumnasR = convertirColumnaUnidad(matrix, primeraFila);
    validarValorR(matrix, primeraFila, indicesColumnasR);
    console.log('Primera',matrix);
    
    for (let i = 0; i < 2; i++) {
      if (!validarColumnaUnidadR(matrix, indicesColumnasR)) break;
      if (!hayPositivosEnZ(matrix[matrix.length - 1])) break;
      const columna = obtenerMasPositivo(matrix[matrix.length - 1]);
      const fila = obtenerIndicePivote(matrix, columna);
      convertirCeldaEn1(matrix, fila, columna);
      convertirEnColumnaUnidad(matrix, fila, columna);
      console.log('Iteración', i + 1);
      console.log(matrix);
    }
  }



  return (
    <main className='flex flex-col w-screen min-h-screen items-center pt-28'>
      <h1 className='font-bold text-3xl text-center mt-10 mb-10'>Método de las dos fases</h1>
      <MainTable setTable={actualizarTabla} />
    </main>
  )
}

export default App;