import { Sign } from "../enums/sign";
import { Table } from "../models/table";

// Paso 1
export const verificacionUltimaColumna = (table: Table) => {
    table.restrictions.forEach((row, index) => {
        const value = parseInt(row[row.length - 1]);
        if (value < 0) {
            row.forEach((cell, index) => {
                row[index] = (parseInt(cell) * -1).toString();
            })
            switch (table.restrictionsType[index]) {
                case Sign.LESS_THAN_EQUAL:
                    table.restrictionsType[index] = Sign.GREATER_THAN_EQUAL;
                    break;
                case Sign.GREATER_THAN_EQUAL:
                    table.restrictionsType[index] = Sign.LESS_THAN_EQUAL;
                    break;
                default:
                    break;
            }
        }
    })
}

// Paso 2
export const agregarVariablesArtificiales = (table: Table) => {
    let e = 1;
    let r = 1;
    table.restrictions.forEach((row, index) => {
        if (table.restrictionsType[index] === Sign.GREATER_THAN_EQUAL) {
            table.restrictions[index].push(`-E${e}`);
            table.restrictions[index].push(`+R${r}`);
            e++;
            r++;
        } else if (table.restrictionsType[index] === Sign.LESS_THAN_EQUAL) {
            table.restrictions[index].push(`+E${e}`);
            e++;
        } else {
            table.restrictions[index].push(`+R${r}`);
            r++;
        }
    })
}

// Paso 3
export const generarMatriz = (table: Table) => {
    const matrix: number[][] = [];

    const cantidadVariables = table.z.length;
    const cantidadRs = table.restrictions.map((row) => row.filter((cell) => cell.includes('R')).length).reduce((acc, curr) => acc + curr, 0);
    const cantidadEs = table.restrictions.map((row) => row.filter((cell) => cell.includes('E')).length).reduce((acc, curr) => acc + curr, 0);

    // 1 es r
    const cantidadTotalVariables = cantidadVariables + cantidadRs + cantidadEs + 2;
    const primeraFila: string[] = [];

    for (let i = 0; i < cantidadVariables; i++) {
        primeraFila.push(`X${i + 1}`);
    }
    for (let i = 0; i < cantidadEs; i++) {
        primeraFila.push(`E${i + 1}`);
    }
    for (let i = 0; i < cantidadRs; i++) {
        primeraFila.push(`R${i + 1}`);
    }
    primeraFila.push('r');
    primeraFila.push('b');

    table.restrictions.forEach((row, rowIndex) => {
        matrix.push([]);
        for (let i = 0; i < cantidadTotalVariables; i++) {
            matrix[rowIndex].push(0);
        }
        row.forEach((cell, cellIndex) => {
            try {
                const value = parseInt(cell);
                if (isNaN(value) || cellIndex == cantidadVariables) {
                    throw new Error('No es un número');
                }
                matrix[rowIndex][cellIndex] = parseInt(cell);
            } catch (error) {
                const letra = cell.replace('+', '').replace('-', '');
                const numeroLetra = parseInt(letra.replace('E', '').replace('R', ''));
                if (letra.includes('E')) {
                    let indexAux = cantidadVariables + numeroLetra - 1;
                    matrix[rowIndex][indexAux] = cell.includes('+') ? 1 : -1;
                }
                if (letra.includes('R')) {
                    let indexAux = cantidadVariables + cantidadEs + numeroLetra - 1;
                    matrix[rowIndex][indexAux] = cell.includes('+') ? 1 : -1;
                }
            }
        })
        matrix[rowIndex][cantidadTotalVariables - 1] = parseInt(table.restrictions[rowIndex][cantidadVariables]);
    })
    matrix.push([]);
    for (let i = 0; i < cantidadTotalVariables; i++) {
        if (primeraFila[i].includes('R')) {
            matrix[matrix.length - 1][i] = -1;
        } else if (primeraFila[i] === 'r') {
            matrix[matrix.length - 1][i] = 1;
        } else {
            matrix[matrix.length - 1][i] = 0;
        }
    }
    return { matrix, primeraFila };
}

export const convertirColumnaUnidad = (matrix: number[][], primeraFila: string[]) => {
    const indicesColumnasR = primeraFila.map((cell, index) => cell.includes('R') ? index : -1).filter((index) => index !== -1);
    indicesColumnasR.forEach((indexColumna) => {
        let indexFila = -1;
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][indexColumna] === 1) {
                indexFila = i;
                break;
            }
        }
        let array1 = matrix[indexFila];
        let array2 = matrix[matrix.length - 1];
        for (let i = 0; i < array1.length; i++) {
            matrix[matrix.length - 1][i] = array1[i] + array2[i];
        }
    })
    return indicesColumnasR;
}

export const validarValorR = (matrix: number[][], primeraFila: string[], indicesR: number[]) => {
    let suma = 0;
    indicesR.forEach((indexColumna) => {
        let indexFila = -1;
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][indexColumna] === 1) {
                indexFila = i;
                break;
            }
        }
        suma += matrix[indexFila][matrix[indexFila].length - 1];
    })
    const valorR = matrix[matrix.length - 1][matrix[matrix.length - 1].length - 1];
    if (suma !== valorR) {
        // ! verificar
        throw new Error('No tiene solución');
    }
}

export const obtenerMasPositivo = (array: number[]) => {
    let index = -1;
    let value = -1;
    array.forEach((element, i) => {
        if (i === array.length - 1) return;
        if (element > value) {
            value = element;
            index = i;
        }
    })
    return index;
}

export const obtenerIndicePivote = (matrix: number[][], indiceColumna: number) => {
    let index = -1;
    let value = Number.MAX_SAFE_INTEGER;
    matrix.forEach((row, i) => {
        if (i === matrix.length - 1) return;
        if (row[indiceColumna] > 0) {
            const division = row[row.length - 1] / row[indiceColumna];
            if (division < value) {
                value = division;
                index = i;
            }
        }
    })
    return index;
}

export const convertirCeldaEn1 = (matrix: number[][], indiceFila: number, indiceColumna: number) => {
    const valor = matrix[indiceFila][indiceColumna];
    if (valor === 1) return;
    const numeroInverso = 1 / valor;
    matrix[indiceFila].forEach((element, i) => {
        matrix[indiceFila][i] = element * numeroInverso;
    })
    
}

export const convertirEnColumnaUnidad = (matrix: number[][], indiceFila: number, indiceColumna: number) => {
    matrix.forEach((row, i) => {
        if (i !== indiceFila) {
            const value = row[indiceColumna] * -1;
            console.log('Value', value);
            row.forEach((element, j) => {
                matrix[i][j] = element + (value * matrix[indiceFila][j]);
            })
        }
    })
    
}

export const hayPositivosEnZ = (array: number[]): boolean => {
    let hayPositivos = false;
    array.forEach((element, i) => {
        if (i === array.length - 2) return false;
        if (element > 0) {
            hayPositivos = true;
        }
    })
    return hayPositivos;
}

export const validarColumnaUnidadR = (matriz: number[][], indicesColumnasR: number[]): boolean => {
    indicesColumnasR.forEach((index) => {
        let hayUnUno = false;
        for (let i = 0; i < matriz.length; i++) {
            const valorActual = matriz[i][index];
            if (hayUnUno && valorActual !== 0) {
                return false;
            }
            if (valorActual === 1) {
                if (hayUnUno) {
                    return false;
                }
                hayUnUno = true;
            } else if (valorActual !== 0) {
                return false;
            }
        }
    })
    return true;
}
