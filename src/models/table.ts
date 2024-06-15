import { Sign } from "../enums/sign";
import { Type } from "../enums/type";

export interface ICoefficient {
    variable: string;
    value: number;
}

export interface IRestriction {
    coefficients: ICoefficient[];
    sign: Sign;
    term: number;
}

export interface ITable {
    type: Type;
    z: number[];
    restrictions: IRestriction[];
}