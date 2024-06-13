import { faEquals, faGreaterThanEqual, faLessThanEqual, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem } from "@nextui-org/react";
import { Sign } from "../enums/sign";
import { ToastContainer, toast } from 'react-toastify';
import { useState } from "react";
import { Table } from "../models/table";
import { Type } from "../enums/type";
import 'react-toastify/dist/ReactToastify.css';

interface MainTableProps {
    setTable: (table: Table) => void;
}

export default function MainTable({ setTable }: MainTableProps) {
    const [type, setType] = useState<Type>(Type.MIN);
    const [valuesZ, setValuesZ] = useState<string[]>([]);
    const [valuesRestrictions, setValuesRestrictions] = useState<string[][]>([]);
    const [restrictionsType, setRestrictionsType] = useState<string[]>([]);

    const options = [
        { key: "min", label: "Min" },
        { key: "max", label: "Max" },
    ];

    const addVariable = () => {
        if (valuesZ.length >= 5) return;
        const newValues = [...valuesZ];
        newValues.push('0');
        setValuesZ(newValues);

        const newValuesRestrictions = [...valuesRestrictions];
        newValuesRestrictions.forEach((restriction) => {
            restriction.push('0')
        });
        setValuesRestrictions(newValuesRestrictions);
    }

    const deleteVariable = () => {
        if (valuesZ.length <= 1) return;
        const newValues = [...valuesZ];
        newValues.pop();
        setValuesZ(newValues);

        const newValuesRestrictions = [...valuesRestrictions];
        newValuesRestrictions.forEach((restriction) => {
            restriction.pop();
        });
        setValuesRestrictions(newValuesRestrictions);
    }

    const addRestriction = () => {
        if (valuesRestrictions.length >= 5) return;
        const newValues = [...valuesRestrictions];

        newValues.push(valuesZ.map(() => '0'));
        newValues[valuesRestrictions.length].push('0');
        setValuesRestrictions(newValues);

        const newRestrictionsType = [...restrictionsType];
        newRestrictionsType.push("=");
        setRestrictionsType(newRestrictionsType);
    }

    const deleteRestriction = () => {
        if (valuesRestrictions.length <= 1) return;
        const newValues = [...valuesRestrictions];
        newValues.pop();
        setValuesRestrictions(newValues);

        const newRestrictionsType = [...restrictionsType];
        newRestrictionsType.pop();
        setRestrictionsType(newRestrictionsType);
    }

    const onStart = () => {
        if (valuesZ.length < 2) {
            toast.error("Debe haber al menos dos variables en Z");
            return;
        }
        if (valuesRestrictions.length < 1) {
            toast.error("Debe haber al menos una restricción");
            return;
        }
        if (valuesZ.some((value) => parseInt(value) <= 0)) {
            toast.error("Los valores de Z deben ser mayores a 0");
            return;
        }
        const newTable: Table = {
            type,
            z: valuesZ,
            restrictions: valuesRestrictions,
            restrictionsType: restrictionsType
        }
        setTable(newTable);
    }

    return (
        <section className="flex flex-col items-center">
            <Button
                color="success"
                variant="shadow"
                className="mb-8"
                onClick={onStart}
            >
                Comenzar
            </Button>
            <h4 className="mb-2 font-semibold">Variables</h4>
            <div className="flex justify-end space-x-4 mb-6">
                <Button
                    color="primary"
                    isIconOnly
                    onClick={addVariable}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
                <Button
                    color="danger"
                    isIconOnly
                    onClick={deleteVariable}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            </div>
            <div className="flex items-center justify-center space-x-6 mb-12">
                <Select
                    items={options}
                    className="w-20"
                    defaultSelectedKeys={["min"]}
                    onChange={(e) => setType(e.target.value as Type)}
                >
                    {options.map((item) =>
                        <SelectItem key={item.key} value={item.key}>
                            {item.label}
                        </SelectItem>
                    )}
                </Select>
                <span className="text-2xl">Z =</span>
                {valuesZ.map((value, index) => (
                    <div key={`zr-${index}`} className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                            <Input
                                key={`zv-${index}`}
                                type="number"
                                className="w-20"
                                value={value.toString()}
                                onChange={(e) => {
                                    const newValues = [...valuesZ];
                                    newValues[index] = e.target.value;
                                    setValuesZ(newValues);
                                }} />
                            <div className="relative">
                                <span>X</span>
                                <span className="absolute bottom-0 right-[-10px] text-xs">
                                    {index + 1}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <h4 className="mb-2 font-semibold">Restricciones</h4>
            <div className="flex justify-end space-x-4 mb-6">
                <Button
                    color="primary"
                    isIconOnly
                    onClick={addRestriction}
                >
                    <FontAwesomeIcon icon={faPlus} />
                </Button>
                <Button
                    color="danger"
                    isIconOnly
                    onClick={deleteRestriction}
                >
                    <FontAwesomeIcon icon={faTrash} />
                </Button>
            </div>
            <div className="flex flex-col items-center space-y-6">
                {valuesRestrictions.map((row, rowIndex) => (
                    <div key={`r-${rowIndex}`} className="flex items-center space-x-6">
                        <span className="text-2xl">R{rowIndex + 1}:</span>
                        {row.map((col, colIndex) => (
                            <div key={`r-${rowIndex}-c-${colIndex}`} className="flex items-center space-x-6">
                                {colIndex === valuesZ.length && (
                                    <Dropdown
                                        title="Signo"
                                    >
                                        <DropdownTrigger>
                                            <Button color="default" isIconOnly>
                                                <FontAwesomeIcon icon={restrictionsType[rowIndex] === "<=" ? faLessThanEqual : restrictionsType[rowIndex] === Sign.GREATER_THAN_EQUAL ? faGreaterThanEqual : faEquals} />
                                            </Button>
                                        </DropdownTrigger>
                                        <DropdownMenu>
                                            {Object.values(Sign).map((item) =>
                                                <DropdownItem key={item} value={item} onClick={() => {
                                                    const newRestrictionsType = [...restrictionsType];
                                                    newRestrictionsType[rowIndex] = item;
                                                    setRestrictionsType(newRestrictionsType);
                                                }}>
                                                    <FontAwesomeIcon icon={item === Sign.EQUAL ? faEquals : item === Sign.LESS_THAN_EQUAL ? faLessThanEqual : faGreaterThanEqual} />
                                                </DropdownItem>
                                            )}
                                        </DropdownMenu>
                                    </Dropdown>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Input
                                        key={`r-${rowIndex}-c-${colIndex}-input`}
                                        type="number"
                                        className="w-20"
                                        value={col.toString()}
                                        onChange={(e) => {
                                            const newValuesRestrictions = [...valuesRestrictions];
                                            newValuesRestrictions[rowIndex][colIndex] = e.target.value;
                                            setValuesRestrictions(newValuesRestrictions);
                                        }} />
                                    {colIndex < valuesZ.length && (
                                        <div className="relative">
                                            <span>X</span>
                                            <span className="absolute bottom-0 right-[-10px] text-xs">{colIndex + 1}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <ToastContainer />
        </section>
    )
}