import './App.css';
import { ITable } from './models/table';
import { fraction, format } from 'mathjs';
import MainTable from './components/MainTable'
import {
  verificarTerminosIndependientes,
  agregarVariablesArtificiales,
  generarMatriz,
  convertirRColumnaUnidad,
  validarSumaVariablesR,
  obtenerIndiceMasPositivo,
  obtenerIndicePivote,
  convertirPivoteEn1,
  sonColumnasUnidad,
  hayPositivosEnZ,
  convertirEnColumnaUnidad,
  obtenerNuevaFormulacion,
  obtenerNuevaFormulacionVisual,
  hayNegativosEnZ,
  obtenerIndiceMasNegativo,
} from './functions/logic';
import { Type } from './enums/type';
import { useState } from 'react';

function App() {
  const [result, setResult] = useState<string[]>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const roundAndConvertMatrix = (matrix: number[][]) => {
    return matrix.map(row => row.map(num => format(fraction(num), { fraction: 'decimal' })));
  };

  const init = (table: ITable) => {
    verificarTerminosIndependientes(table);
    agregarVariablesArtificiales(table);
    const { matrix, columnIndicesR } = generarMatriz(table);

    columnIndicesR.forEach((columnIndex) => {
      convertirRColumnaUnidad(matrix, columnIndex);
    });

    validarSumaVariablesR(matrix, columnIndicesR);
    let canContinue = true;
    let removeColumnR = false;

    while (canContinue && !removeColumnR) {
      const columnIndex = obtenerIndiceMasPositivo(matrix);
      const { rowIndex, results } = obtenerIndicePivote(matrix, columnIndex);
      convertirPivoteEn1(matrix, rowIndex, columnIndex);
      convertirEnColumnaUnidad(matrix, rowIndex, columnIndex);

      if (!sonColumnasUnidad(matrix, columnIndicesR)) removeColumnR = true;
      if (sonColumnasUnidad(matrix, columnIndicesR) && !hayPositivosEnZ(matrix)) canContinue = false;
    }

    if (removeColumnR) {
      const newMatrix = obtenerNuevaFormulacion(matrix, columnIndicesR, table.z);
      table.z.map((z, index) => {
        const { rowIndex, results } = obtenerIndicePivote(newMatrix, index);
        convertirEnColumnaUnidad(newMatrix, rowIndex, index);
      });

      canContinue = true;
      if (table.type === Type.MAX) {
        while (canContinue) {
          if (!hayNegativosEnZ(newMatrix)) canContinue = false;
          const columnIndex = obtenerIndiceMasNegativo(newMatrix);
          const { rowIndex, results } = obtenerIndicePivote(newMatrix, columnIndex);
          convertirPivoteEn1(newMatrix, rowIndex, columnIndex);
          convertirEnColumnaUnidad(newMatrix, rowIndex, columnIndex);
        }
      } else {
        while (canContinue) {
          if (!hayPositivosEnZ(newMatrix)) canContinue = false;
          const columnIndex = obtenerIndiceMasPositivo(newMatrix);
          const { rowIndex, results } = obtenerIndicePivote(newMatrix, columnIndex);
          convertirPivoteEn1(newMatrix, rowIndex, columnIndex);
          convertirEnColumnaUnidad(newMatrix, rowIndex, columnIndex);
        }
      }
      console.log('Matriz final', newMatrix);
      setResult(resultsToText(roundAndConvertMatrix(newMatrix), table.z.length, table.type));
    } else if (canContinue) {
      console.log('No se puede continuar');
      setResult(['No se puede continuar']);
      setIsError(true);
    }
  }

  const resultsToText = (matrix: string[][], quantityVariables: number, type: Type) => {
    const results: string[] = [];
    results.push(`Hay un ${type === Type.MAX ? 'máximo' : 'mínimo'} en:`);
    const z = matrix[matrix.length - 1][matrix[0].length - 1];

    results.push(`Z = ${z}`);
    for (let i = 0; i < quantityVariables; i++) {
      const row = matrix.find((row) => row[i] === '1');
      if (row) {
        const value = row[row.length - 1].toString();
        results.push(`X${i + 1} = ${value}`)
      } else {
        results.push(`X${i + 1} = 0`);
      }
    }
    return results;
  }

  return (
    <main className='flex flex-col w-screen min-h-screen pt-28 px-72'>
      <h1 className='font-bold text-3xl text-center mb-20'>Método de las dos fases</h1>
      <div className='flex justify-between w-full gap-16'>
        <MainTable init={init} />
        <section className='w-1/2 border-l-2 border-gray-300 px-20'>
          <h2 className='font-bold text-2xl text-center mb-8'>Resultado</h2>
          <div className='flex flex-col gap-4'>
            {isError ? <p className='text-red-500 text-center'>No se puede continuar</p> : result.map((row, index) => (
              <p key={index} className='text-center'>{row}</p>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

export default App;