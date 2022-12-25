
interface IApiOptions {
  url: string
  data?: any
}

interface IGetOptions {
  url: string
}
interface IPostOptions extends IGetOptions {
  data: any
}
interface IDeleteOptions extends IGetOptions {}
interface IPutOptions extends IPostOptions {}


const api = (method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE', options: IApiOptions) => {
    
  return fetch('/api' + options.url, {
      method: method,
      headers: options.data?{'Content-Type': 'application/json'}:undefined,
      redirect: 'follow',
      body: options.data?JSON.stringify(options.data): undefined
    }).then(response=>response.json())
}

export const get = (options: IGetOptions) => {
    return api("GET", options)
  }

export const post = (options: IPostOptions) => {
    return api("POST", options)
  }

export const patch = (options: IPostOptions) => {
  return api("PATCH", options)
}

export const put = (options: IPutOptions) => {
    return api("PUT", options)
  }

export const del = (options: IDeleteOptions) => {
    return api("DELETE", options)
  }

