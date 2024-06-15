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
import { IResult } from './models/result';

function App() {
  const [txtProcedure, setTxtProcedure] = useState<IResult[]>([]);
  const [txtResult, setTxtResult] = useState<string[]>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const [showProcedure, setShowProcedure] = useState<boolean>(false);

  const roundAndConvertMatrix = (matrix: number[][]) => {
    const newMatrix = matrix.map(row => row.map(num => format(fraction(num), { fraction: 'decimal' })));
    return newMatrix.map(row => row.map(num => num.replace('(', '').replace(')', '')));
  };

  const cleanInfo = () => {
    setTxtProcedure([]);
    setTxtResult([]);
    setIsError(false);
  }

  const init = (table: ITable, stepByStep: boolean) => {
    setShowProcedure(stepByStep);
    cleanInfo();
    const cloneTable = JSON.parse(JSON.stringify(table));
    verificarTerminosIndependientes(cloneTable, addTxtResult);
    agregarVariablesArtificiales(cloneTable, addTxtResult);
    const { matrix, columnIndicesR } = generarMatriz(cloneTable, addTxtResult);

    columnIndicesR.forEach((columnIndex) => {
      convertirRColumnaUnidad(matrix, columnIndex, addTxtResult);
    });

    try {
      validarSumaVariablesR(matrix, columnIndicesR);
    } catch (e) {
      setIsError(true);
      return;
    }

    let canContinue = true;
    let removeColumnR = false;

    while (canContinue && !removeColumnR) {
      const columnIndex = obtenerIndiceMasPositivo(matrix, addTxtResult);
      const { rowIndex, results } = obtenerIndicePivote(matrix, columnIndex, addTxtResult);
      convertirPivoteEn1(matrix, rowIndex, columnIndex, addTxtResult);
      convertirEnColumnaUnidad(matrix, rowIndex, columnIndex, addTxtResult);

      if (!sonColumnasUnidad(matrix, columnIndicesR)) removeColumnR = true;
      if (sonColumnasUnidad(matrix, columnIndicesR) && !hayPositivosEnZ(matrix)) canContinue = false;
    }

    if (removeColumnR) {
      const txtResult: IResult = {
        message: 'Se eliminan las columnas R'
      };
      addTxtResult(txtResult);
      const newMatrix = obtenerNuevaFormulacion(matrix, columnIndicesR, table.z, addTxtResult);
      // obtenerNuevaFormulacionVisual(matrix, columnIndicesR, table, addTxtResult);
      cloneTable.z.map((z, index) => {
        const { rowIndex, results } = obtenerIndicePivote(newMatrix, index, addTxtResult);
        convertirEnColumnaUnidad(newMatrix, rowIndex, index, addTxtResult);
      });

      canContinue = true;
      if (cloneTable.type === Type.MAX) {
        while (canContinue) {
          if (!hayNegativosEnZ(newMatrix)) canContinue = false;
          const columnIndex = obtenerIndiceMasNegativo(newMatrix);
          const { rowIndex, results } = obtenerIndicePivote(newMatrix, columnIndex, addTxtResult);
          convertirPivoteEn1(newMatrix, rowIndex, columnIndex, addTxtResult);
          convertirEnColumnaUnidad(newMatrix, rowIndex, columnIndex, addTxtResult);
        }
      } else {
        while (canContinue) {
          if (!hayPositivosEnZ(newMatrix)) canContinue = false;
          const columnIndex = obtenerIndiceMasPositivo(newMatrix, addTxtResult);
          const { rowIndex, results } = obtenerIndicePivote(newMatrix, columnIndex, addTxtResult);
          convertirPivoteEn1(newMatrix, rowIndex, columnIndex, addTxtResult);
          convertirEnColumnaUnidad(newMatrix, rowIndex, columnIndex, addTxtResult);
        }
      }
      console.log('newMatrix', newMatrix);
      addFinalResults(roundAndConvertMatrix(newMatrix), table.z.length, table.type);
    } else if (canContinue) {
      console.log('No se puede continuar');
      setIsError(true);
    }
  }

  const addFinalResults = (matrix: string[][], quantityVariables: number, type: Type) => {
    const message: string[] = [];
    const z = matrix[matrix.length - 1][matrix[0].length - 1];
    message.push(`Hay un ${type === Type.MAX ? 'máximo' : 'mínimo'} en:`);
    message.push(`Z = ${z}`);
    for (let i = 0; i < quantityVariables; i++) {
      const row = matrix.find((row) => row[i] === '1');
      if (row) {
        const value = row[row.length - 1].toString();
        message.push(`X${i + 1} = ${value}`);
      } else {
        message.push(`X${i + 1} = 0`);
      }
    }
    setTxtResult(message);
  }

  const showResults = () => {
    console.log(result);
  }

  const addTxtResult = (result: IResult) => {
    setTxtProcedure((prev) => [...prev, result]);
  }

  return (
    <main className='flex flex-col w-screen min-h-screen py-28 px-72'>
      <h1 className='font-bold text-3xl text-center mb-20'>Método de las dos fases</h1>
      <div className='flex justify-between w-full gap-16'>
        <MainTable init={init} cleanInfo={cleanInfo} />
        <section className='w-1/3 border-l-2 border-gray-300 px-20'>
          <h2 className='font-bold text-2xl text-center mb-8'>Resultado</h2>
          <div className='flex flex-col gap-6 text-center'>
            {isError && <p className='text-red-500'>No se puede continuar</p>}
            {!isError && txtResult.map((item, index) => (
              <p key={'res-' + index} className=''>{item}</p>
            ))}
          </div>
        </section>
      </div>
      {txtResult.length > 0 && showProcedure && (
        <section className='mt-40'>
          <h2 className='font-bold text-2xl text-center mb-8'>Procedimiento</h2>
          <div className='flex flex-col gap-12 text-center w-fit mx-auto'>
            {isError ? <p className='text-red-500'>No se puede continuar</p> : txtProcedure.map((item, index) => (
              <div key={'res-' + index} className='flex flex-col gap-2 items-center'>
                <p key={'res-' + index} className=''>{item.message}</p>
                {item.table && (
                  <div className='flex flex-col gap-2'>
                    <div className='flex gap-2'>
                      {item.table.type === Type.MAX ? <p className=''>MAX</p> : <p className=''>MIN</p>}
                      {item.table.z.map((z, index) => (
                        <p key={'z-' + index} className=''>{z} <span className='text-[0.75rem]'>X{index + 1}</span></p>
                      ))}
                    </div>
                    {item.table.restrictions.map((restriction, index) => (
                      <div key={'res-' + index} className='flex gap-2'>
                        {restriction.coefficients.map((coefficient, index) => (
                          <p key={'coefficient-' + index} className=''>{coefficient.value} <span className='text-[0.75rem]'>{coefficient.variable}</span></p>
                        ))}
                        <p className=''>{restriction.sign} {restriction.term}</p>
                      </div>
                    ))}
                  </div>
                )}
                {item.matrix && (
                  <table className='border border-gray-300'>
                    <thead>
                      <tr>
                        {item.firstRow && item.firstRow.map((column, index) => (
                          <th key={'col-' + index} className='border border-gray-300 w-12 h-12'>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {roundAndConvertMatrix(item.matrix).map((row, index) => (
                        <tr key={'row-' + index}>
                          {row.map((column, index) => (
                            <td key={'col-' + index} className='border border-gray-300 w-12 h-12'>{column}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default App;