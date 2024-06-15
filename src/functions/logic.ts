import { Sign } from "../enums/sign";
import { ITable } from "../models/table";

// Paso 1: se verifica si el término independiente de las restricciones es negativo
export const verificarTerminosIndependientes = (table: ITable) => {
    table.restrictions.forEach((restriction, index) => {
        const term = restriction.term;
        if (term < 0) {
            restriction.term = term * -1;
            restriction.coefficients.forEach((coefficient, i) => {
                restriction.coefficients[i].value = coefficient.value * -1;
            })
            switch (restriction.sign) {
                case Sign.LESS_THAN_EQUAL:
                    table.restrictions[index].sign = Sign.GREATER_THAN_EQUAL;
                    break;
                case Sign.GREATER_THAN_EQUAL:
                    table.restrictions[index].sign = Sign.LESS_THAN_EQUAL;
                    break;
                default:
                    break;
            }
        }
    })
}

// Paso 2: se agregan las variables artificiales
export const agregarVariablesArtificiales = (table: ITable) => {
    let e = 1;
    let r = 1;
    table.restrictions.forEach((restriction) => {
        switch (restriction.sign) {
            case Sign.LESS_THAN_EQUAL:
                restriction.coefficients.push({ variable: `E${e}`, value: 1 });
                restriction.sign = Sign.EQUAL;
                e++;
                break;
            case Sign.GREATER_THAN_EQUAL:
                restriction.coefficients.push({ variable: `E${e}`, value: -1 });
                restriction.coefficients.push({ variable: `R${r}`, value: 1 });
                restriction.sign = Sign.EQUAL;
                e++;
                r++;
                break;
            default:
                restriction.coefficients.push({ variable: `R${r}`, value: 1 });
                r++;
                break;
        }
    })
}

// Paso 3: se genera la matriz
export const generarMatriz = (table: ITable) => {
    const matrix: number[][] = [];
    const columnIndicesR: number[] = [];

    const quantityVariables = table.z.length;
    const quantityRs = table.restrictions.map((row) => row.coefficients.filter((cell) => cell.variable.includes('R')).length).reduce((acc, curr) => acc + curr, 0);
    const quantityEs = table.restrictions.map((row) => row.coefficients.filter((cell) => cell.variable.includes('E')).length).reduce((acc, curr) => acc + curr, 0);

    const totalQuantity = quantityVariables + quantityRs + quantityEs;

    // Se agregan las variables X
    for (let i = 0; i < table.restrictions.length; i++) {
        matrix.push([]);
        table.restrictions[i].coefficients.forEach((cell) => {
            if (cell.variable.includes('X')) {
                matrix[i].push(cell.value);
            }
        })
    }

    // Se agregan las variables E
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < quantityEs; j++) {
            const coefficient = table.restrictions[i].coefficients.filter((cell) => cell.variable === `E${j + 1}`)[0];
            matrix[i].push(coefficient?.value || 0);
        }
    }

    // Se agrega la fila de la función objetivo
    matrix.push([]);
    for (let i = 0; i < totalQuantity; i++) {
        matrix[matrix.length - 1].push(0);
    }

    // Se agregan las variables R y el -1 en la fila de la función objetivo
    for (let i = 0; i < matrix.length - 1; i++) {
        for (let j = 0; j < quantityRs; j++) {
            const coefficient = table.restrictions[i].coefficients.filter((cell) => cell.variable === `R${j + 1}`)[0];
            if (coefficient) {
                matrix[i].push(coefficient.value);
                matrix[matrix.length - 1][j + quantityVariables + quantityEs] = -1;
                columnIndicesR.push(j + quantityVariables + quantityEs);
            } else {
                matrix[i].push(0);
            }
        }
    }

    // Se agrega la columna 'r' y 'b'
    for (let i = 0; i < matrix.length; i++) {
        matrix[i].push(i === matrix.length - 1 ? 1 : 0);
        matrix[i].push(i === matrix.length - 1 ? 0 : table.restrictions[i].term);
    }

    return { matrix, columnIndicesR };
}

// Paso 4: se convierte la columna en unidad
export const convertirRColumnaUnidad = (matrix: number[][], columnIndex: number) => {
    let rowIndex = -1;
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][columnIndex] === 1) {
            rowIndex = i;
            break;
        }
    }

    for (let i = 0; i < matrix[rowIndex].length; i++) {
        const value1 = matrix[rowIndex][i];
        const value2 = matrix[matrix.length - 1][i];
        matrix[matrix.length - 1][i] = value1 + value2;
    }
}

// Paso 5: se verifica si el valor de 'r' coincide con la suma de las variables 'R'
export const validarSumaVariablesR = (matrix: number[][], columnIndicesR: number[]) => {
    let sum = 0;
    columnIndicesR.forEach((columnIndex) => {
        let rowIndex = -1;
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][columnIndex] === 1) {
                rowIndex = i;
                break;
            }
        }
        sum += matrix[rowIndex][matrix[rowIndex].length - 1];
    })

    const r = matrix[matrix.length - 1][matrix[matrix.length - 1].length - 1];
    if (sum !== r) {
        throw new Error('No tiene solución');
    }
}

// Paso 6: se obtiene el índice de la columna con el valor más positivo en la fila de la función objetivo
export const obtenerIndiceMasPositivo = (matrix: number[][]): number => {
    let index = -1;
    let value = -1;
    const row = matrix[matrix.length - 1];
    // Se resta 2 para no considerar la columna 'r' y 'b'
    for (let i = 0; i < row.length - 2; i++) {
        if (row[i] > value) {
            value = row[i];
            index = i;
        }
    }
    return index;
}

export const obtenerIndiceMasNegativo = (matrix: number[][]): number => {
    let index = -1;
    let value = -1;
    const row = matrix[matrix.length - 1];
    // Se resta 1 para no considerar la columna 'b'
    for (let i = 0; i < row.length - 1; i++) {
        if (row[i] < value) {
            value = row[i];
            index = i;
        }
    }
    return index;
}

// Paso 7: se obtiene el resultado de la división de la columna 'b' entre la columna seleccionada y se obtiene el índice del pivote
export const obtenerIndicePivote = (matrix: number[][], columnIndex: number) => {
    const results: string[] = [];
    let rowIndex = -1;
    let value = Number.MAX_SAFE_INTEGER;
    matrix.forEach((row, i) => {
        if (i === matrix.length - 1) return;
        if (row[columnIndex] > 0) {
            const division = row[row.length - 1] / row[columnIndex];
            results.push(row[row.length - 1] + ' / ' + row[columnIndex] + ' = ' + division);
            if (division < value) {
                value = division;
                rowIndex = i;
            }
        } else {
            results.push('∞');
        }
    })
    return { rowIndex, results };
}

// Paso 8: se convierte el pivote en 1 en caso de que no lo sea
export const convertirPivoteEn1 = (matrix: number[][], rowIndex: number, columnIndex: number) => {
    const value = matrix[rowIndex][columnIndex];
    if (value === 1) return;
    const inverse = 1 / value;
    matrix[rowIndex].forEach((element, i) => {
        matrix[rowIndex][i] = element * inverse;
    })
}

// Paso 9: se convierte en columna unidad
export const convertirEnColumnaUnidad = (matrix: number[][], rowIndex: number, columnIndex: number) => {
    matrix.forEach((row, i) => {
        // Se omite la fila del pivote
        if (i === rowIndex) return;
        const value = row[columnIndex] * -1;
        row.forEach((element, j) => {
            matrix[i][j] = element + (value * matrix[rowIndex][j]);
        })
    })
}

// Paso 10: se verifica si las columnas 'R' son columna unidad
export const sonColumnasUnidad = (matrix: number[][], columnIndicesR: number[]): boolean => {
    let isUnit = false;
    columnIndicesR.forEach((columnIndex) => {
        isUnit = true;
        let rowIndex = -1;

        // Se obtiene el índice de la fila que contiene el 1
        for (let i = 0; i < matrix.length; i++) {
            if (matrix[i][columnIndex] === 1) {
                rowIndex = i;
                break;
            }
        }
        matrix.forEach((row, i) => {
            if (i === rowIndex) return;
            if (row[columnIndex] !== 0) {
                isUnit = false;
            }
        })
        if (!isUnit) return false;
    });
    return isUnit;
}

// Paso 11: se verifica si hay valores positivos en la fila de la función objetivo
export const hayPositivosEnZ = (matrix: number[][]): boolean => {
    const row = matrix[matrix.length - 1];
    let exists = false;
    row.forEach((element, i) => {
        if (i === row.length - 1 || i === row.length - 2) return;
        if (element > 0) {
            exists = true;
        }
    });
    return exists;
}

export const hayNegativosEnZ = (matrix: number[][]): boolean => {
    const row = matrix[matrix.length - 1];
    let exists = false;
    row.forEach((element, i) => {
        if (i === row.length - 1 || i === row.length - 2) return;
        if (element < 0) {
            exists = true;
        }
    });
    return exists;
}

// Paso 12: se eliminan las columnas 'R' y se obtiene la nueva matriz
export const obtenerNuevaFormulacion = (matrix: number[][], columnIndicesR: number[], z: number[]): number[][] => {
    const newMatrix: number[][] = [];
    matrix.forEach((row) => {
        newMatrix.push(row.filter((element, i) => !columnIndicesR.includes(i)));
    });
    for (let i = 0; i < newMatrix[0].length; i++) {
        newMatrix[newMatrix.length - 1][i] = (z[i] ?? 0) * -1;
    }
    newMatrix[newMatrix.length - 1][newMatrix[newMatrix.length - 1].length - 2] = 1;
    return newMatrix;
}

export const obtenerNuevaFormulacionVisual = (matrix: number[][], columnIndicesR: number[], table: ITable) => {
    const quantityVariables = table.z.length;
    const newMatrix: string[][] = [];
    matrix.splice(matrix.length - 1, 1);
    matrix.forEach((row, rowIndex) => {
        newMatrix.push([]);
        row.forEach((element, i) => {
            if (i === row.length - 2 || columnIndicesR.includes(i)) return;
            if (i < quantityVariables) {
                newMatrix[rowIndex].push(`X${i + 1} = ${element}`);
            } else if (i !== row.length - 1 && element !== 0) {
                newMatrix[newMatrix.length - 1].push(`E${i - quantityVariables + 1} = ${element}`);
            } else if (element !== 0) {
                newMatrix[newMatrix.length - 1].push(`b = ${element}`);
            }
        })
    })
    return newMatrix;
}

export const obtenerIndicesX = (matrix: number[][], quantityVariables: number): number[] => {
    const indices: number[] = [];
    matrix.forEach((row, i) => {
        if (i === matrix.length - 1) return;
        row.forEach((element, j) => {
            if (j < quantityVariables && element === 0) {
                indices.push(j);
            }
        })
    })
    return indices;
}