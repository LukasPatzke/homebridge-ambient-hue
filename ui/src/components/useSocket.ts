import { useContext } from 'react';
import openSocket from 'socket.io-client';
import { AppContext } from './State'
import { isPlatform } from  '@ionic/react';


export const useSocket = ({namespace='/'}) => {
  const { state } = useContext(AppContext);

  if (isPlatform('desktop') || isPlatform('mobileweb')) {
    return openSocket(namespace)
  } else {
    let url = '';
    url+=state?.ssl?'https://':'http://'
    url+=state?.server
    url+=state?.port?`:${state.port}`:''
    url+=namespace
    return openSocket(url)
  }
}