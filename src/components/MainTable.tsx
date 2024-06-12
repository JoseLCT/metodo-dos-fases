import { faEquals, faGreaterThanEqual, faLessThanEqual, faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Input, Select, SelectItem } from "@nextui-org/react";
import { useState } from "react";

enum Sign {
    PLUS = "+",
    MINUS = "-",
    EQUAL = "=",
    LESS_THAN = "<",
    GREATER_THAN = ">",
}

interface Cell {
    value: number;
    sign: Sign;
}

export default function MainTable() {
    const options = [
        { key: "min", label: "Min" },
        { key: "max", label: "Max" },
    ];

    const [valuesZ, setValuesZ] = useState<Cell[]>([]);
    const [valuesRestrictions, setValuesRestrictions] = useState<Cell[][]>([]);

    const addVariable = () => {
        if (valuesZ.length >= 5) return;
        const newValues = [...valuesZ];
        newValues.push({ value: 0, sign: Sign.PLUS });
        setValuesZ(newValues);

        const newValuesRestrictions = [...valuesRestrictions];
        newValuesRestrictions.forEach((restriction) => {
            restriction.push({ value: 0, sign: Sign.PLUS });
        });
        setValuesRestrictions(newValuesRestrictions);
    }

    const addRestriction = () => {
        if (valuesRestrictions.length >= 5) return;
        const newValues = [...valuesRestrictions];

        newValues.push(valuesZ.map(() => ({ value: 0, sign: Sign.PLUS })));
        newValues[valuesRestrictions.length].push({ value: 0, sign: Sign.EQUAL });
        setValuesRestrictions(newValues);
    }

    return (
        <section className="flex flex-col items-center space-y-12">
            <div className="flex items-center space-x-6">
                <Button
                    endContent={<FontAwesomeIcon icon={faPlus} />}
                    color="primary"
                    onClick={addVariable}
                >
                    Agregar variable
                </Button>
                <Button
                    endContent={<FontAwesomeIcon icon={faPlus} />}
                    variant="flat"
                    color="primary"
                    disabled={valuesZ.length === 0}
                    onClick={addRestriction}
                >
                    Agregar restricción
                </Button>
            </div>
            <div className="flex items-center justify-center space-x-6">
                <Select
                    items={options}
                    className="w-20"
                    defaultSelectedKeys={["min"]}
                >
                    {options.map((item) =>
                        <SelectItem key={`mm-${item.key}`} value={item.key}>
                            {item.label}
                        </SelectItem>
                    )}
                </Select>
                <span className="text-2xl">Z =</span>
                {valuesZ.map((cell, index) => (
                    <div key={`zr-${index}`} className="flex items-center space-x-6">
                        <Dropdown
                            key={`zd-${index}`}
                            title="Signo"
                        >
                            <DropdownTrigger>
                                <Button color="default" isIconOnly>
                                    <FontAwesomeIcon icon={cell.sign === "+" ? faPlus : faMinus} />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                onAction={(key) => {
                                    const newValues = [...valuesZ];
                                    newValues[index].sign = key as Sign;
                                    setValuesZ(newValues);
                                }}
                            >
                                {Object.values(Sign).filter((item) => item === "+" || item === "-").map((item) =>
                                    <DropdownItem key={item} value={item}>
                                        <FontAwesomeIcon icon={item === "+" ? faPlus : faMinus} />
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </Dropdown>
                        <div className="flex items-center space-x-2">
                            <Input
                                key={`zv-${index}`}
                                type="number"
                                className="w-20"
                                min={1}
                                value={cell.value.toString()}
                                onChange={(e) => {
                                    const newValues = [...valuesZ];
                                    newValues[index].value = parseInt(e.target.value);
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
            <div className="flex flex-col items-center space-y-6">
                {valuesRestrictions.map((restriction, indexRestriction) => (
                    <div key={`r-${indexRestriction}`} className="flex items-center space-x-6">
                        <span className="text-2xl">R{indexRestriction + 1}:</span>
                        {restriction.map((cell, indexCell) => (
                            <div key={`r-${indexRestriction}-c-${indexCell}`} className="flex items-center space-x-6">
                                <Dropdown
                                    title="Signo"
                                >
                                    <DropdownTrigger>
                                        <Button color="default" isIconOnly>
                                            {indexCell < valuesZ.length ? (
                                                <FontAwesomeIcon icon={cell.sign === "+" ? faPlus : faMinus} />
                                            ) : (
                                                <FontAwesomeIcon icon={cell.sign === "=" ? faEquals : cell.sign === "<" ? faLessThanEqual : faGreaterThanEqual} />
                                            )}
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu
                                        onAction={(key) => {
                                            const newValuesRestrictions = [...valuesRestrictions];
                                            newValuesRestrictions[indexRestriction][indexCell].sign = key as Sign;
                                            setValuesRestrictions(newValuesRestrictions);
                                        }}
                                    >
                                        {indexCell < valuesZ.length ? (
                                            Object.values(Sign).filter((item) => item === "+" || item === "-").map((item) =>
                                                <DropdownItem key={item} value={item}>
                                                    <FontAwesomeIcon icon={item === "+" ? faPlus : faMinus} />
                                                </DropdownItem>
                                            )) : (
                                            Object.values(Sign).filter((item) => item !== "+" && item !== "-").map((item) =>
                                                <DropdownItem key={item} value={item}>
                                                    <FontAwesomeIcon icon={item === "=" ? faEquals : item === "<" ? faLessThanEqual : faGreaterThanEqual} />
                                                </DropdownItem>
                                            ))
                                        }
                                    </DropdownMenu>
                                </Dropdown>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        key={`r-${indexRestriction}-c-${indexCell}-input`}
                                        type="number"
                                        className="w-20"
                                        min={0}
                                        value={cell.value.toString()}
                                        onChange={(e) => {
                                            const newValuesRestrictions = [...valuesRestrictions];
                                            newValuesRestrictions[indexRestriction][indexCell].value = parseInt(e.target.value);
                                            setValuesRestrictions(newValuesRestrictions);
                                        }} />
                                    {indexCell < valuesZ.length && (
                                        <div className="relative">
                                            <span>X</span>
                                            <span className="absolute bottom-0 right-[-10px] text-xs">{indexCell + 1}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </section>
    )
}