import { ITable } from "./table";

export interface IResult {
    message: string;
    table?: ITable;
    matrix?: number[][];
    firstRow?: string[];
}