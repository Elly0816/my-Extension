import { Fragment } from "react";
import { pageProps } from "../../App";
import "./Secrets.css";

interface SecretsProps {
    secret:string,
    setPassword?:React.Dispatch<React.SetStateAction<pageProps>>,
    logout?:()=>void,
    regenerateSecret?:()=>void
}

type DependentProps<T> = T extends {logout:()=>void} ? {regenerateSecret:()=>void} : {}

type SecretWithDependentProps = SecretsProps & DependentProps<SecretsProps>


const Secrets:React.FC<SecretWithDependentProps> = ({secret, setPassword, logout, regenerateSecret})=>{
    
    return <Fragment>
        <div>
            <span>{secret}</span>
        </div>

        { setPassword && <button onClick={()=>{setPassword({page: 'password'})}}>Set Password</button> }
        { logout && regenerateSecret && <div className="secrets_buttons">
            <button onClick={logout}>Logout</button>
            <button onClick={regenerateSecret}>Regenerate Secret</button>
        </div> }

    </Fragment>
}


export default Secrets;