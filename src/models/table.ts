import { Type } from "../enums/type";

export interface Table {
    type: Type;
    z: string[];
    restrictions: string[][];
    restrictionsType: string[];
}