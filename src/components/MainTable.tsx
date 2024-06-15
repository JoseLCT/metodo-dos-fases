import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem } from "@nextui-org/react";
import { faEquals, faGreaterThanEqual, faLessThanEqual, faPlus, faRotateRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Sign } from "../enums/sign";
import { ToastContainer, toast } from 'react-toastify';
import { useState } from "react";
import { Type } from "../enums/type";
import { ITable } from "../models/table";
import 'react-toastify/dist/ReactToastify.css';

interface MainTableProps {
    init: (table: ITable, stepByStep: boolean) => void;
    cleanInfo: () => void;
}

export default function MainTable({ init, cleanInfo }: MainTableProps) {
    // const [table, setTable] = useState<ITable>({
    //     type: Type.MIN,
    //     z: [0, 0],
    //     restrictions: []
    // });

    const [table, setTable] = useState<ITable>({
        type: Type.MIN,
        z: [4, 1],
        restrictions: [
            {
                coefficients: [
                    { value: 3, variable: 'X1' },
                    { value: 1, variable: 'X2' }
                ],
                sign: Sign.EQUAL,
                term: 3
            },
            {
                coefficients: [
                    { value: 4, variable: 'X1' },
                    { value: 3, variable: 'X2' }
                ],
                sign: Sign.GREATER_THAN_EQUAL,
                term: 6
            },
            {
                coefficients: [
                    { value: 1, variable: 'X1' },
                    { value: 2, variable: 'X2' }
                ],
                sign: Sign.LESS_THAN_EQUAL,
                term: 4
            }
        ],
    });

    const options = [
        { key: Type.MIN, label: "Min" },
        { key: Type.MAX, label: "Max" }
    ];

    const onInit = (stepByStep: boolean) => {
        if (table.z.length < 2) {
            toast.error("Debe haber al menos dos variables en Z");
            return;
        }
        if (table.restrictions.length < 1) {
            toast.error("Debe haber al menos una restricción");
            return;
        }
        if (table.z.some((value) => value <= 0)) {
            toast.error("Los valores de Z deben ser mayores a 0");
            return;
        }
        init(table, stepByStep);
    }

    const addVariable = () => {
        if (table.z.length >= 4) return;
        const newTable = { ...table };
        newTable.z.push(0);
        newTable.restrictions.forEach((restriction) => {
            restriction.coefficients.push({ value: 0, variable: `X${newTable.z.length}` });
        });
        setTable(newTable);
    }

    const deleteVariable = () => {
        if (table.z.length <= 1) return;
        const newTable = { ...table };
        newTable.z.pop();
        newTable.restrictions.forEach((restriction) => {
            restriction.coefficients.pop();
        });
        setTable(newTable);
    }

    const addRestriction = () => {
        if (table.restrictions.length >= 4) return;
        const newTable = { ...table };
        newTable.restrictions.push({
            coefficients: table.z.map((value, index) => ({ value: 0, variable: `X${index + 1}` })),
            sign: Sign.EQUAL,
            term: 0
        });
        setTable(newTable);
    }

    const deleteRestriction = () => {
        if (table.restrictions.length <= 1) return;
        const newTable = { ...table };
        newTable.restrictions.pop();
        setTable(newTable);
    }

    const onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTable = { ...table };
        newTable.type = e.target.value === Type.MAX ? Type.MAX : Type.MIN;
        setTable(newTable);
    }

    const onZChange = (index: number, value: string) => {
        const newTable = { ...table };
        newTable.z[index] = parseInt(value);
        setTable(newTable);
    }

    const onCoefficientChange = (rowIndex: number, colIndex: number, value: string) => {
        const newTable = { ...table };
        newTable.restrictions[rowIndex].coefficients[colIndex].value = parseInt(value);
        setTable(newTable);
    }

    const onSignChange = (index: number, value: Sign) => {
        const newTable = { ...table };
        newTable.restrictions[index].sign = value;
        setTable(newTable);
    }

    const onTermChange = (index: number, value: string) => {
        const newTable = { ...table };
        newTable.restrictions[index].term = parseInt(value);
        setTable(newTable);
    }

    const onClean = () => {
        setTable({
            type: Type.MIN,
            z: [0, 0],
            restrictions: []
        });
        cleanInfo();
    }

    const onStepByStep = () => {
        onInit(true);
    }

    const directResult = () => {
        onInit(false);
    }


    return (
        <section className="flex flex-col w-2/3">
            <div className="flex gap-4 justify-center">
                <h2 className='font-bold text-2xl text-center mb-8'>Problema</h2>
                <Button
                    color="primary"
                    variant="ghost"
                    onClick={onClean}
                    isIconOnly
                >
                    <FontAwesomeIcon icon={faRotateRight} />
                </Button>
            </div>
            <div className="flex gap-4 items-center mb-8">
                <Button
                    color="primary"
                    variant="ghost"
                    className="w-1/2"
                    onClick={onStepByStep}
                >
                    Paso a paso
                </Button>
                <Button
                    color="primary"
                    variant="solid"
                    className="w-1/2"
                    onClick={directResult}
                >
                    Resultado directo
                </Button>
            </div>
            <h4 className="mb-1 font-semibold text-small">Variables</h4>
            <div className="flex gap-4 mb-6">
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
            <div className="flex gap-4 mb-12">
                <Select
                    items={options}
                    className="w-20"
                    defaultSelectedKeys={["min"]}
                    onChange={onTypeChange}
                >
                    {options.map((item) =>
                        <SelectItem key={item.key} value={item.key}>
                            {item.label}
                        </SelectItem>
                    )}
                </Select>
                <span className="text-2xl">Z =</span>
                <div className="flex gap-8">
                    {table.z.map((value, index) => (
                        <div key={`z-r-${index}`} className="flex items-center gap-2">
                            <Input
                                key={`z-v-${index}`}
                                type="number"
                                className="w-20"
                                value={value.toString()}
                                onChange={(e) => onZChange(index, e.target.value)} />
                            <div className="relative">
                                <span>X</span>
                                <span className="absolute bottom-0 right-[-10px] text-xs">
                                    {index + 1}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <h4 className="mb-1 font-semibold text-small">Restricciones</h4>
            <div className="flex gap-4 mb-6">
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
            <div className="flex flex-col space-y-6">
                {table.restrictions.map((row, rowIndex) => (
                    <div key={`r-${rowIndex}`} className="flex gap-8">
                        {row.coefficients.map((col, colIndex) => (
                            <div key={`r-${rowIndex}-c-${colIndex}`} className="flex items-center gap-2">
                                <Input
                                    key={`r-${rowIndex}-c-${colIndex}-input`}
                                    type="number"
                                    className="w-20"
                                    value={col.value.toString()}
                                    onChange={(e) => onCoefficientChange(rowIndex, colIndex, e.target.value)}
                                />
                                <div className="relative">
                                    <span>X</span>
                                    <span className="absolute bottom-0 right-[-10px] text-xs">{colIndex + 1}</span>
                                </div>
                            </div>
                        ))}
                        <Dropdown title="Signo">
                            <DropdownTrigger>
                                <Button color="default" isIconOnly>
                                    {row.sign === Sign.EQUAL && <FontAwesomeIcon icon={faEquals} />}
                                    {row.sign === Sign.LESS_THAN_EQUAL && <FontAwesomeIcon icon={faLessThanEqual} />}
                                    {row.sign === Sign.GREATER_THAN_EQUAL && <FontAwesomeIcon icon={faGreaterThanEqual} />}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                {Object.values(Sign).map((item) =>
                                    <DropdownItem key={item} value={item} onClick={() => onSignChange(rowIndex, item)}>
                                        {item === Sign.EQUAL && <FontAwesomeIcon icon={faEquals} />}
                                        {item === Sign.LESS_THAN_EQUAL && <FontAwesomeIcon icon={faLessThanEqual} />}
                                        {item === Sign.GREATER_THAN_EQUAL && <FontAwesomeIcon icon={faGreaterThanEqual} />}
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                        <Input
                            type="number"
                            className="w-20"
                            value={row.term.toString()}
                            onChange={(e) => onTermChange(rowIndex, e.target.value)}
                        />
                    </div>
                ))}
            </div>
            <ToastContainer />
        </section>
    )
}