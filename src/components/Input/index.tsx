import { ChangeEvent, FC, FormEvent, useState, useContext } from "react";
import { TerminalContext } from "../../context/terminal.context";
import "./index.css";

const Input:FC = ()=>{
    const { commands, setCommand} = useContext(TerminalContext);
    const [command, setCommand_] = useState<string>("");
    const handleSubmit= (evt: FormEvent<HTMLFormElement>)=>{
            evt.preventDefault();
            if(command in commands && command !== "clear")
                setCommand((prev)=>[...prev, {...commands[command], command}]);
            if(command === "clear")
                setCommand([]);
            if(!(command in commands) && command !== "clear")
                setCommand((prev)=>[...prev, {output_error: `invalid command: "${command}". please use "help" for more info`, command}]);
            setCommand_("");
    };
    const handleChange = (evt: ChangeEvent<HTMLInputElement>)=>{
        setCommand_(evt.target.value);
    }
    return <form onSubmit={handleSubmit}>
        <input className="bg-transparent text-white font-[200] p-0 focus:outline-none w-[100vw] break-words"
                  name="command"
                  value={command}
                  onChange={handleChange}
        />
    </form>
};

export default Input;