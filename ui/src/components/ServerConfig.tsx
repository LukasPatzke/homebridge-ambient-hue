import React, { useState, createRef, useContext } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonLabel, IonButton, IonButtons,  IonItemDivider, IonToggle, IonList } from '@ionic/react';

import { useTranslation } from 'react-i18next';
import { Content } from './Content';
import icon from '../icons/icon-transparent.png';
import { ListHeader } from './ListHeader';
import { ListFooter } from './ListFooter';
import { AppContext } from './State';

interface IServerConfigProps {
  isOpen: boolean
  onClose: ()=>void
  pageRef?: HTMLElement;
}

export const ServerConfig: React.FC<IServerConfigProps> = ({isOpen, onClose, pageRef}) => {
  const { state, dispatch } = useContext(AppContext);

  const [server, setServer] = useState(state?.server);
  const [port, setPort] = useState(state?.port);
  const [ssl, setSsl] = useState(state?.ssl);

  const { t } = useTranslation(['settings', 'common']);

  const handleSubmit = () => {
    dispatch({
      type: 'setServer',
      server: server,
      port: port,
      ssl: ssl
    })
    onClose()
  }
  return (
    <IonModal isOpen={isOpen} swipeToClose presentingElement={pageRef} onDidDismiss={onClose} >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('settings:server.title')}</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={handleSubmit}>{t('common:actions.done')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Content>
        <IonItemDivider/>
        <Server 
          values={{server: server, port:port, ssl:ssl}} 
          onChange={{setServer: setServer, setPort: setPort, setSsl: setSsl}}
        />
      </Content>
    </IonModal>
  )
}

interface IInitialConfigProps {
  isOpen: boolean
  pageRef?: HTMLElement;
}

export const InitialConfig: React.FC<IInitialConfigProps> = ({isOpen, pageRef}) => {
  const { state, dispatch } = useContext(AppContext);

  const [server, setServer] = useState(state?.server);
  const [port, setPort] = useState(state?.port);
  const [ssl, setSsl] = useState(state?.ssl);

  const { t } = useTranslation(['settings', 'common']);
  
  const handleSubmit = () => {
    dispatch({
      type: 'setServer',
      server: server,
      port: port,
      ssl: ssl
    })
  }
  return (
    <IonModal animated={true} isOpen={isOpen} presentingElement={pageRef} >
      <IonHeader>
        <IonToolbar></IonToolbar>
      </IonHeader>
      <IonContent scrollY={false}>
        < IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" style={{textAlign: 'center'}}>Hue Dimmer</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItemDivider/>
        <img alt='icon' src={icon} style={{width: '50%', margin: 'auto', display:'block'}}/>
        <IonItemDivider/>
        <ListHeader><IonLabel>Server Configuration</IonLabel></ListHeader>
        <Server 
          inset
          values={{server: server, port:port, ssl:ssl}} 
          onChange={{setServer: setServer, setPort: setPort, setSsl: setSsl}}
        />
        <IonButton className='inset' disabled={!server} onClick={handleSubmit} expand='block'>
          {t('common:actions.done')}
        </IonButton>
      </IonContent>
    </IonModal>
  )
}


interface IServerProps {
  values: {
    server?: string
    port?: number
    ssl?: boolean
  }
  onChange: {
    setServer: (value: string)=>void
    setPort: (value: number)=>void
    setSsl: (value: boolean)=>void
  }
  inset?: boolean
}
const Server: React.FC<IServerProps> = ({onChange, values={server: '', port:8080, ssl:false}, inset=false}) => {
  
  const serverRef = createRef<HTMLIonInputElement>();
  const portRef = createRef<HTMLIonInputElement>();

  const { t } = useTranslation('settings');

  return (
    <>
    <IonList inset={inset}>
      <IonItem >
        <IonLabel>{t('server.server')}</IonLabel>
        <IonInput 
          ref={serverRef} 
          type='url' 
          placeholder='example.com'
          value={values.server}
          onIonChange={(e)=>onChange.setServer(e.detail.value as string)}
        />
      </IonItem>
      <IonItem lines='none' >
        <IonLabel>{t('server.port')}</IonLabel>
        <IonInput 
          ref={portRef} 
          type='number' 
          placeholder='Optional'
          value={values.port}
          onIonChange={(e)=>onChange.setPort(parseInt(e.detail.value as string))}
        />
      </IonItem>
      </IonList>
      {!inset?<IonItemDivider/>:undefined}
      <IonList inset={inset} className='lp-remove-margin-bottom'>
        <IonItem>
          <IonLabel>{t('server.secure')}</IonLabel>
          <IonToggle checked={values.ssl} onIonChange={(e)=>onChange.setSsl(e.detail.checked)}/>
        </IonItem>
      </IonList>
      <ListFooter>
        <IonLabel>
          SSL (https://) verwendet eine verschlüsselte Verbindung zum Server.
        </IonLabel>
      </ListFooter>
    </>
  )
}