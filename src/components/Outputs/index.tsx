import { FC, useContext, useEffect } from "react";
import { TerminalContext } from "../../context/terminal.context";
import { Init } from "../Init";

export const Outputs:FC = () => {
    const { command, setCommand } = useContext(TerminalContext);
    useEffect(()=>{
        setCommand([{command:"init", output: "Welcome to my portfolio\n\tuse 'help' to see all available commands.\n"}]);
    }, [setCommand]);
    return (<div>
        {command && command.map((obj, i)=>{
            if(obj.command === "init")
                return <Init key={i}/>;
            else
                return (<section key={i}>
                <p className="font-dejavu text-[#64e986] font-extrabold font-12 absolute">
                    aymane@aymane
                    <span className="text-white">:</span>
                    <span className="text-blue-400">
                        ~/portfolio
                        <span className="text-white">     {obj.command}</span>
                    </span>
                </p>
                <br />
                {("output_error" in obj) ? <p className="text-white">
                    {obj.output_error}
                </p> : <>
                    <div>
                        {obj.output.split("\n").map((str, j)=><p key={j}  className={`text-white ${ (j !== 0) && "ml-5"}`} >{str}</p>)}
                    </div>

                    {("links" in obj) && obj.links.map((link, j)=>(
                        <a key={j} className="text-black max-w-max bg-gray-700 block mt-2" href={link.includes("@") ? "mailto:"+link : link} target="_blank" rel="noopener noreferrer">
                            {link}
                        </a>
                    ))}
                </>}
              </section>);
        })}
    </div>);
};