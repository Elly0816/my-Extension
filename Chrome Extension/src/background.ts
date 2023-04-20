import crypto from 'crypto-js';
import path from 'path';

class App {

    private tabId:number|undefined;
    private secret:string|undefined;
    private length:number|undefined;
    private isInitialized:boolean|undefined;
    // private isRunning:boolean=false;
    private secretKey:string="This is the secret Key";;


    /*
        On installation, the app should check for the secret
        if it does not exist, it should create the popup show user the secret, 
        and on the next screen should ask for a password



        if it does exist, it should face the user with a sign in page
    */
    constructor (length:number){
        this.length = length;
        // this.isRunning=true;
        
    }

    async createWindow(type:'popup'|'normal'):Promise<void>{
        // chrome.runtime.onInstalled.addListener(async()=>{
            let url = type === "normal" ? "../index.html":'index.html'
            console.log("This is the url: ", url);
           const popUp =  await chrome.windows.create({
                url: url,
                width: 500,
                height: 800,
                type: type
            });
            console.log("Getting the popUp id, ", popUp.id? 'There is an id': 'There is no Id');
            try {
                
                this.tabId = popUp.id as number;
            } catch (error) {
                console.log("there was an error getting the tab id");
                console.log(error);
            }
        // });
    }

    getTabId(): number{
        return this.tabId as number;
    }

    //Send a message to the tab
    sendMessage(message?:string, payload?:string):void{
        let toSend:{message:string|undefined, payload:string|undefined} = {
            message:message,
            payload:payload
        }

        if (typeof this.tabId === 'number'){
            chrome.tabs.query({windowId:this.tabId}, (tabs)=>{
                chrome.tabs.sendMessage(tabs[0].id as number, toSend)
            })
        } else {
            chrome.runtime.sendMessage(toSend);
        }
    }

    //Listen to messages from the tab
    listenMessage(reqMessage:string, cb:(message:{message:string, payload:string})=>void):void{
        chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
            if(message.message === reqMessage){
                cb(message);
            }
        })
    }

    //Check if it has been initialized before
    checkInitialized(cb:(initialized:boolean)=>void):void{
        this.getFromStorage('secret', (key, err)=>{
            if(err){
                /*
                    Generate and present to the user a new secret
                    The secret should be a random string of a static length
                */
                console.log(err);
                this.generateSecret();
                console.log("The aoo has not been initialized before");
                this.isInitialized=false
            } else {
                /*
                    The extension has been initialized before
                    face the user with a sign in page 
                    or if the initialization was not complete, 
                    ask the user to go through the initialization process again
                */
                console.log("The app has been initialized before");
                this.secret = this.decrypt(key as string);
                this.isInitialized=true;
            }
            cb(this.isInitialized);
        })
    }

    //This should generate a secret and 
    generateSecret():void{
        let result:string="";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i=0; i<(this.length as number); i++){
            result += characters.charAt(Math.floor(Math.random() * characters.length))
        }
        this.secret = result;
        console.log("This is the secret in the generate Secret function: ", this.secret);
    }

    getSecret():undefined|string{
        return this.secret;
    }

    getFromStorage(key:string, cb:(key:string|null, err:Error|null)=>void){
        chrome.storage.local.get(key, (data)=>{
            if(data[key]){
                cb(data[key], null)
            } else {
                const error = new Error(`The ${key} key was not found`);
                cb(null, error);
            }
        });
    }

    store(key:'secret'|'password', value:string){
        chrome.storage.local.set({[key]: value});
    }

    // getRunState():boolean{
    //     return this.isRunning;
    // }

    encrypt(input:string):string{
        return crypto.AES.encrypt(input, this.secretKey).toString();
    }

    decrypt(input:string):string{
        let bytes =  crypto.AES.decrypt(input, this.secretKey);
        return bytes.toString(crypto.enc.Utf8);
    }

}






// chrome.management.setEnabled(manifest.name, false);
// chrome.management.setEnabled(manifest.name, true);

//Intialize the extension
chrome.runtime.onInstalled.addListener(()=>{
    console.log("The app is running after installation");
    runApp();
});

chrome.action.onClicked.addListener(()=>{
    console.log("The app is running from clicking the icon");
    runApp();
})



// "default_popup": "index.html"


function runApp(){

    const app = new App(16);
    
    //Check if the extension is initialized and send a message to it
    app.checkInitialized(async (initialized)=>{
        if(initialized){
            /*
                The  app has been initialized before and the user should be logged in
            */
            // await app.createWindow('normal').then(()=>{
            //     app.listenMessage('connected', ()=>{
            //         console.log('received a message from the client');
            //     })
            // })
    
    
            // await app.createWindow('normal')
            //     .then(()=>{
            //         app.listenMessage('connected', ()=>{
            //             app.sendMessage('connected');
            //             app.sendMessage('login');
            //         })
            //     })
    
            // chrome.action.onClicked.addListener(async (tab)=>{
                // "default_popup": "index.html",
                // chrome.tabs.create({url:"index.html"})
                // .then(()=>{
                //     app.listenMessage('connected', ()=>{
                //         app.sendMessage('connected');
                //         app.sendMessage('login');
                //     })
                // })
    
    
                await app.createWindow('normal')
                .then(()=>{
                    app.listenMessage('connected', ()=>{
                        app.sendMessage('connected');
                        app.sendMessage('login');
                    })
                })
    
            // })
        } else {
            /*
            The user has not initialized the app before and the 
            user should be shown a secret
            */
           await app.createWindow('popup').then(()=>{
            app.listenMessage('connected', ()=>{
                console.log('You received a message from the client');
                app.sendMessage('connected');
                app.sendMessage('home');
                app.sendMessage('secret', app.getSecret() as string);
                
            })
            
            
            
        });
    }
    
    const secret:string = app.getSecret() as string;
    console.log('This is the secret: ',secret);
    app.sendMessage('secret', secret);
    
    app.listenMessage('password confirmed', (message)=>{
        /*
            Store the encrypted password and secret
        */
        console.log('message: ', message.message, message.payload);
        const password = app.encrypt(message.payload);
        app.store('password', password);
        const secret = app.encrypt(app.getSecret() as string);
        app.store('secret', secret);
        console.log('secret and password encrypted and saved');
        app.sendMessage('secret saved');
    
    })
    
    app.listenMessage('Login', (message)=>{
        /*
            Check if the password is correct or not
            If it is, show the user the secret else tell the user the password was not correct
        */
        app.getFromStorage('password', (pass, err)=>{
            if (pass){
                let password = app.decrypt(pass);
                if (password === message.payload){
                    app.sendMessage('password correct');
                    console.log('password correct');
                    app.sendMessage('secret from login', app.getSecret() as string);
                } else {
                    app.sendMessage('password incorrect');
                    console.log('password incorrect');
                }
            } else {
                console.log(err);
            }
        });
    });
    
    
    app.listenMessage('regenerateSecret', ()=>{
        console.log('regenerating the secret');
        app.generateSecret();
        const newSecret = app.getSecret();
        app.store('secret', app.encrypt(newSecret as string));
        console.log("Here is the new Secret: ", newSecret)
        app.sendMessage('new secret', newSecret);
    })
    
    
    // chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
    //     if (message.message === 'password confirmed'){
    //         console.log("Password confirmed: ", message.payload);
    //     } else if (message.message === 'change Secret'){
    //         console.log("Change Secret: ", message.payload);
    //     } 
    // })
    });
}



