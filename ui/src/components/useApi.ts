import { Plugins } from '@capacitor/core';
import { isPlatform } from '@ionic/react';

const { Storage } = Plugins;

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
  
  let baseUrl: Promise<string>;
  if (isPlatform('desktop') || isPlatform('mobileweb') ) {
    baseUrl = new Promise<string>((resolve)=>resolve('/api'))
  } else {
    const server = Storage.get({key:'apiServer'});
    const port = Storage.get({key:'apiPort'});
    const ssl = Storage.get({key:'apiSsl'});
    baseUrl = Promise.all([server, port, ssl]).then(([server, port, ssl])=>{
      return new Promise<string>((resolve, reject)=>{
        if ((!server.value) || (server.value==='')) {
          reject('server not in storage')
        } else {
          var url='';
          if (ssl.value==='true') {url+='https://'} else {url+='http://'}
          url += server.value;
          if (port.value!=='null') {url+=`:${port.value}`}
          url += '/api'
          resolve(url)
        }
      })
    })
  }
  return baseUrl.then(baseUrl=>(
    fetch(baseUrl + options.url, {
      method: method,
      headers: {'Content-Type': 'application/json'},
      redirect: 'follow',
      body: JSON.stringify(options.data)
    })
  )).then(response=>response.json())
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

