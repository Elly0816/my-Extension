import { ChangeEventHandler, FormEvent, FormEventHandler, Fragment, useEffect, useState } from "react"
import "./Password.css";



const Passwords:React.FC = ()=>{
    const [password1, setPassword1] = useState<string>();
    const [password2, setPassword2] = useState<string>();
    const[wrong, setWrong] = useState<boolean>();

    useEffect(()=>{
        console.log("this is password1: ", password1);
        console.log("this is password2: ", password2);
    }, [password1, password2]);

    
    function submit(e:FormEvent){
        e.preventDefault();
        console.log("this is password1: ", password1);
        console.log("this is password2: ", password2);
        if(password1===password2){
            //Store the encrypted password and the secret
            chrome.runtime.sendMessage({message: 'password confirmed', payload: password1});
        } else {
            setWrong(true);
            setTimeout(()=>{
                setWrong(false);
            }, 3000);
        }
    }

    function handle1(e:InputEvent){
        const {name, value} = e.target as unknown as  {name:string, value:string};
        setPassword1(value);
    }
    
    function handle2(e:InputEvent){
        const {name, value} = e.target as unknown as  {name:string, value:string};
        setPassword2(value);
    }


    return <Fragment>
        {wrong && <div className='wrong'><span>The passwords do not match</span></div>}
        <form onSubmit={submit}>
            <label htmlFor="password1">Password:</label>
            <input onChange={handle1 as unknown as ChangeEventHandler<HTMLInputElement>} value={password1} type="password" name="password1" placeholder="Enter your password here"/>
            <br />
            <label htmlFor="password2">Password:</label>
            <input onChange={handle2 as unknown as ChangeEventHandler<HTMLInputElement>} value={password2} type="password" name="password2" placeholder="Confirm your password here"/>
            <br />
            <button type="submit">Submit</button>
        </form>
    </Fragment>
}


export default Passwords;