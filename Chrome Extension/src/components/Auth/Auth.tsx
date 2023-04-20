


const Auth:React.FC<{secret:string}> = ({secret})=>{

    function changeSecret(){
        chrome.runtime.sendMessage('change Secret');
    }



    return <div>
            <span>{secret}</span>
            <button onClick={changeSecret}>Change Secret</button>
        </div>
}


export default Auth;