import users from './users'

import axios, {AxiosRequestConfig} from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_ICPDAO_BACKEND_BASE_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';


const request = (logicInfo: any, ...args: any[]) => {
    let info = logicInfo(args)
    let path =  info.path
    let method = info.method
    let search = info?.search
    let body = info?.body
    let needAuth = info?.needAuth
    if (search) {
        let params = new URLSearchParams();
        for (const key in search) {
            params.append(key, search[key])
        }
        path = `${path}?${params.toString()}`
    }
    let config:AxiosRequestConfig = {
        method: method,
        url: path
    }
    if (body) {
        config.data = body
    }
    if (needAuth) {
        config.headers = { 'Authorization': localStorage.getItem('jwt') }
    }
    return axios(config)
}

const logic = {users}
export {request as default, logic}
