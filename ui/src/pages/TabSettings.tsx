import { IonButton, IonButtons, IonContent, IonGrid, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonModal, IonNote, IonPage, IonTitle, IonToggle, IonToolbar, isPlatform, IonSpinner } from '@ionic/react';
import { checkmark, globe, language, lockClosed, alertCircle, link, colorWand, reloadCircle, syncCircle } from 'ionicons/icons';
import React, { useContext, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ListHeader } from 'src/components/ListHeader';
import { ServerConfig } from 'src/components/ServerConfig';
import { Content } from '../components/Content';
import { AppContext } from '../components/State';
import { IBridge, ISettings } from 'src/types/hue';
import { get, put } from 'src/components/useApi';
import devicesBridgesV2 from '../icons/hue/devicesBridgesV2.svg';
import homebridge from '../icons/homebridge.svg';
import { ListFooter } from 'src/components/ListFooter';
import { HueConfig } from 'src/components/HueConfig';
import { ListDivider } from 'src/components/ListDivider';
import { HomebridgeAssistant } from 'src/components/HomebridgeAssistant';

const TabSettings: React.FC = () => {
  const [ isLanguageOpen, setLanguageOpen ] = useState(false);
  const [ isServerOpen, setServerOpen ] = useState(false)
  const [ isHueConfigOpen, setHueConfigOpen] = useState(false)
  const [ bridge, setBridge ] = useState<IBridge>()
  const [ isBridgeSync, setBridgeSync ] = useState(false)
  const [ isBridgeSyncErr, setBridgeSyncErr ] = useState(false)
  const [ smartOff, setSmartOff ] = useState(false)
  const [ isHomebridgeOpen, setHomebridgeOpen ] = useState(false)

  const { t, i18n } = useTranslation('settings');
  const pageRef = useRef();

  const { state } = useContext(AppContext);

  useEffect(()=>{
    get({url: '/bridge/'}).then(setBridge)
    get({url: '/settings/'}).then((settings:ISettings)=>setSmartOff(settings.smart_off))
  }, [])

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('title')}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid fixed>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>{t('title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ListDivider/>
        <IonList>
          <IonItem button onClick={()=>setLanguageOpen(true)}>
            <IonLabel>{t('language')}</IonLabel>
            <IonIcon slot='start' icon={language} color='primary'/>
            <IonNote slot='end'>{t(`languageOptions.${i18n.language}`)}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>{t('smart_off')}</IonLabel>
            <IonIcon  slot='start' icon={colorWand} color='primary'/>
            <IonToggle checked={smartOff} onIonChange={(e)=>{
              put({
                url: '/settings/', 
                data: {smart_off: e.detail.checked}}
              ).then((settings:ISettings)=>setSmartOff(settings.smart_off))
            }} />
          </IonItem>
        </IonList>
        <ListFooter><IonLabel>{t('smart_off_text')}</IonLabel></ListFooter>
        {(isPlatform('desktop') || isPlatform('mobileweb'))?undefined:
        <>
        <ListHeader><IonLabel>Server</IonLabel></ListHeader>
        <IonList>
        
          <IonItem button onClick={()=>setServerOpen(true)}>
            <IonLabel>{t('server.title')}</IonLabel>
            <IonIcon slot='start' icon={globe} color='primary'/>
            {state?.ssl?<IonIcon color='medium' size='small' icon={lockClosed} style={{marginRight: '5px'}}/>:undefined}
            <IonNote slot='end'>{state?.server}</IonNote>
          </IonItem>
        </IonList>
        </>}
        <ListHeader><IonLabel>Hue Bridge</IonLabel></ListHeader>
        <IonList>
          <IonItem button onClick={()=>setHueConfigOpen(true)}>
            <IonIcon slot='start' icon={devicesBridgesV2} color='primary'/>
            <IonLabel>{bridge?.name||'Hue Bridge'}</IonLabel>
            <IonNote slot='end'>{bridge?.ipaddress}</IonNote>
          </IonItem>
          <IonItem onClick={()=>{
            setBridgeSyncErr(false)
            setBridgeSync(true)
            get({url: '/bridge/sync'}
            ).then(()=>{
              setBridgeSync(false)
            }).catch(()=>{
              setBridgeSync(false)
              setBridgeSyncErr(true)
            })
          }}
          >
            <IonIcon slot='start' icon={syncCircle} color='primary'/>
            <IonLabel>Sync with bridge</IonLabel>
            {isBridgeSync?<IonSpinner slot='end'/>:undefined}
            {isBridgeSyncErr?<IonIcon slot='end' icon={alertCircle} color='danger'/>:undefined}
          </IonItem>
        </IonList>
        <ListHeader><IonLabel>Extern</IonLabel></ListHeader>
        <IonList>
          <IonItem routerLink='/settings/webhooks' routerDirection='forward'>
            <IonIcon slot='start' icon={link} color='primary'/>
            <IonLabel>Webhooks</IonLabel>
          </IonItem>
          <IonItem button onClick={()=>setHomebridgeOpen(true)} >
            <IonIcon slot='start' icon={homebridge} color='primary'/>
            <IonLabel>{t('homebridge')}</IonLabel>
          </IonItem>
        </IonList>
        <ListHeader><IonLabel>Debug</IonLabel></ListHeader>
        <IonList>
          <IonItem onClick={window.location.reload}>
            <IonLabel>{t('reload')}</IonLabel>
            <IonIcon slot='start' icon={reloadCircle} color='primary'/>
          </IonItem>
        </IonList>
        <LangageSettings isOpen={isLanguageOpen} pageRef={pageRef.current} onClose={()=>setLanguageOpen(false)}/>
        <ServerConfig isOpen={isServerOpen} pageRef={pageRef.current} onClose={()=>setServerOpen(false)}/>
        <HueConfig 
          isOpen={isHueConfigOpen} 
          onFinish={(bridge)=>bridge.then(data=>{setBridge(data);setHueConfigOpen(false)})} 
          onAbbort={()=>setHueConfigOpen(false)} 
        />
        <HomebridgeAssistant isOpen={isHomebridgeOpen} pageRef={pageRef.current} onClose={()=>setHomebridgeOpen(false)}/>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}
export default TabSettings;

interface ILanguageSettingsProps {
  isOpen: boolean;
  onClose: ()=>void;
  pageRef?: HTMLElement;
}

const LangageSettings: React.FC<ILanguageSettingsProps> = ({isOpen, onClose, pageRef}) => {
  const { t, i18n } = useTranslation(['common', 'settings']);
  const languages = i18n.languages || []
  const languageItems = languages.map((language, index)=>(
    <IonItem key={index} button detailIcon='none' onClick={()=>i18n.changeLanguage(language, ()=>{onClose()})}>
      <IonLabel>{t(`settings:languageOptionsLocal.${language}`)}
      <IonNote color='dark' >{t(`settings:languageOptions.${language}`)}</IonNote>
      </IonLabel>
      
      {language===i18n.language?<IonIcon color='primary' icon={checkmark} />:undefined}
    </IonItem>
  ))
  return (
    <IonModal isOpen={isOpen} presentingElement={pageRef} swipeToClose onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('settings:language')}</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={onClose}>{t('common:actions.cancel')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Content>
        <IonList lines='inset' >
          {languageItems}
        </IonList>
      </Content>
    </IonModal>
  )
}
