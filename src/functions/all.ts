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
    table.restrictions.forEach((row, index) => {
        if (table.restrictionsType[index] === Sign.GREATER_THAN_EQUAL) {
            table.restrictions[index].push(`-E${index + 1}`);
            table.restrictions[index].push(`+R${index + 1}`);
        } else if (table.restrictionsType[index] === Sign.LESS_THAN_EQUAL) {
            table.restrictions[index].push(`+E${index + 1}`);
        } else {
            table.restrictions[index].push(`+R${index + 1}`);
        }
    })
}