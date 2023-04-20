import { ChangeEventHandler, FormEvent, Fragment, useState } from 'react';
import './Login.css';


const Login:React.FC = ()=>{
    const [password, setPassword] = useState<string|undefined>();

    function handleChange(e:InputEvent){
        const {name, value} = e.target as unknown as {name:string, value:string};
        setPassword(value);
    }

    function handleSubmit(e:FormEvent){
        e.preventDefault();
        chrome.runtime.sendMessage({message:'Login', payload:password});
    }



    return <form onSubmit={handleSubmit}>
        <label htmlFor="password">Enter your password</label>
        <input name='password' onChange={handleChange as unknown as ChangeEventHandler<HTMLInputElement>} value={password} type="password" />
        <button type='submit'>Submit Password</button>
    </form>
}

export default Login;