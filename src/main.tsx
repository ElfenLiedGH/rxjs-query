import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import {container, Logger} from "./modules/di";
import {rxjsBaseUrlBinding, RxJsRequest, rxJsRequestBinding} from "./modules/api/request";
import App from './App'

console.log('bind', rxJsRequestBinding)
Logger.setLogger((...rargs) => console.log('log',...rargs))
container.bind(rxjsBaseUrlBinding).toConstant('https://jsonplaceholder.typicode.com');
container.bind(rxJsRequestBinding).toClass(RxJsRequest);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)
