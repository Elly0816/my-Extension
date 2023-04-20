import { useEffect, useState, Fragment } from 'react';
import reactLogo from './assets/react.svg'
import viteLogo from './vite.svg'
import './App.css'
import Secrets from './components/Secrets/Secrets';
import Home from './components/Home/Home';
import Password from './components/Password/Password';
import Auth from './components/Auth/Auth';
import Login from './components/Login/Login';

export interface pageProps {
  page: 'home'|'secrets'|'login'|'password'|'auth'|'auth secret'|undefined
}


function App() {
  const [secret, setSecret] = useState<string>();
  const [currentPage, setCurrentPage] = useState<pageProps>({page:undefined})
  const [connected, setConnected] = useState<boolean>(false);

  useEffect(()=>{
    if (!connected){
      chrome.runtime.sendMessage({message: "connected"});
    }
    
    chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
      console.log("This is the message", message);
      console.log("This is the sender", sender);
      
      if (message.message == 'connected'){
        setConnected(true);
      }
      
      if (message.message === 'home'){
        setCurrentPage({page: "home"});
      }

      if (message.message === 'login'){
        setCurrentPage({page: 'login'});
      }

      if (message.message === 'password correct'){
        /*
          Lead the user to a page that shows the secret,
          a logout button, and a button to regenerate a new secret
        */
        setCurrentPage({page: "auth secret"})        

      }

      if(message.message === 'password incorrect'){
        /*
          Tells the user that the password entered was incorrect
        */
      }

      if (message.message === 'secret from login'){
        setSecret(message.payload);
      }



      if (message.message === 'sign-in'){
        setCurrentPage({page:'auth'});
      }

      if (message.message === 'secret'){
          let timer = setTimeout(()=> {
            setCurrentPage({page: 'secrets'});
            console.log(message.payload);
            setSecret(message.payload as string);
            clearTimeout(timer);    
          }, 1500);
      }

      if(message.message === 'secret saved'){
        setCurrentPage({page: 'login'});
      }

      if (message.message === 'new secret'){
        // setCurrentPage({page: 'auth secret'});
        setSecret(message.payload);
      }
    })
    
  }, []);

  function logout():void{
    // chrome.runtime.sendMessage('logout');
    setCurrentPage({page:'login'});
    setSecret(undefined);
  }

  function regenerateSecret(){
    console.log('regenerate Secret');
    chrome.runtime.sendMessage({message: 'regenerateSecret'});
  }

  
  

  return (
    <Fragment>
      { currentPage.page === 'secrets' && <Secrets setPassword={setCurrentPage} secret={secret as string}/>}
      { currentPage.page === 'home' && <Home/>}
      { currentPage.page === 'password' && <Password/> }
      { currentPage.page === 'auth' && <Auth secret={secret as string}/>}
      { currentPage.page === 'login' && <Login/>}
      { currentPage.page === 'auth secret' && <Secrets regenerateSecret={regenerateSecret} secret={secret as string} logout={logout}/>}
    </Fragment>
  )
}

export default App
