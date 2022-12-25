
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
      headers: {'Content-Type': 'application/json'},
      redirect: 'follow',
      body: JSON.stringify(options.data)
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

