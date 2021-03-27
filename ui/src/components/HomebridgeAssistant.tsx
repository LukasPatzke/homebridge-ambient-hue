import React, { useRef, useState, useEffect } from 'react';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonList, IonButtons, IonButton, IonIcon, IonModal, IonInput, IonListHeader, IonSlides, IonSlide } from '@ionic/react';
import { ILight, IGroup } from 'src/types/hue';
import { get, post } from 'src/components/useApi';
import { useTranslation } from 'react-i18next';
import { logoNpm, copy } from 'ionicons/icons';
import homebridge from '../icons/homebridge.svg';
import { Content } from 'src/components/Content';
import { ListHeader } from 'src/components/ListHeader';
import { ListDivider } from 'src/components/ListDivider';
import { ItemSelector, Code } from 'src/pages/PageSettingsWebhook';

interface IHomebridgeAssistantProps {
  isOpen: boolean;
  onClose: ()=>void;
  pageRef?: HTMLElement;
}

interface IHomebridgeWebhookConfig {
  id: string
  name: string
  on_url: string
  on_method: string
  on_body:string
  off_url: string
  off_method: string
  off_body: string
}


export const HomebridgeAssistant: React.FC<IHomebridgeAssistantProps> = ({isOpen, onClose, pageRef}) => {
  const slidesRef = useRef<HTMLIonSlidesElement>(null);

  const [lights, setLights] = useState<ILight[]>([])
  const [groups, setGroups] = useState<IGroup[]>([])
  const [lightIds, setLightIds] = useState<number[]>([])
  const [groupIds, setGroupIds] = useState<number[]>([])

  const location = window.location
  const [url, setUrl] = useState('')
  const [prefix, setPrefix] = useState('ambientHUE')

  const [config, setConfig] = useState('')

  const [slide, setSlide] = useState(0);

  const { t, } = useTranslation(['homebridge', 'common', ' lights', 'groups'], {});

  useEffect(()=>{
    get({url: '/lights/'}).then(setLights)
    get({url: '/groups/'}).then(setGroups)
  }, [])


  const save = () => {
    const id_prefix = prefix?`${prefix}_`:''
    post({
    url: `/webhooks/`,
    data: {
      on: true,
      method: 'GET',
      name: 'Homebridge',
      url: `${url}/?accessoryId=${id_prefix}{item}_{id}&state={on}`,
      lights: lightIds,
      groups: groupIds
  }
    }).then(onClose)
  }

  const generateConfig = () => {
    const selectedLights = lights.filter(l=>lightIds.includes(l.id))
    const selectedGroups = groups.filter(g=>groupIds.includes(g.id))
    const config: IHomebridgeWebhookConfig[] = []
    const id_prefix = prefix?`${prefix}_`:''
    const name_prefix = prefix?`${prefix} `:''
    const backUrl = `${location.protocol}//${location.host}` 

    selectedLights.forEach(light=>{
      config.push({
        id: `${id_prefix}light_${light.id}`,
        name: `${name_prefix}${light.name}`,
        on_url: `${backUrl}/api/lights/${light.id}`,
        on_method: 'PUT',
        on_body: "{ \"on\" : true }",
        off_url: `${backUrl}/api/lights/${light.id}`,
        off_method: 'PUT',
        off_body: "{ \"on\" : false }",
      })
    })

    selectedGroups.forEach(group=>{
      config.push({
        id: `${id_prefix}group_${group.id}`,
        name: `${name_prefix}${group.name}`,
        on_url: `${backUrl}/api/groups/${group.id}`,
        on_method: 'PUT',
        on_body: "{ \"on\" : true }",
        off_url: `${backUrl}/api/groups/${group.id}`,
        off_method: 'PUT',
        off_body: "{ \"on\" : false }",
      })
    })

    return JSON.stringify(config, null, 2)
  }

  const next = () => {
    if (slide===1) {
      setConfig(generateConfig())
    }
    slidesRef.current?.lockSwipeToNext(false);
    setSlide(slide + 1)
    slidesRef.current?.slideNext();
    slidesRef.current?.lockSwipeToNext(true);
    
  }

  const prev = () => {
    slidesRef.current?.lockSwipeToPrev(false);
    setSlide(slide - 1)
    slidesRef.current?.slidePrev();
    slidesRef.current?.lockSwipeToPrev(true);

  }

  const fallbackCopyTextToClipboard = (text: string) => {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
    }
  
    document.body.removeChild(textArea);
  }

  const copyTextToClipboard = (text: string) => {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
      console.error('Async: Could not copy text: ', err);
    });
  }

  return (
  <IonModal isOpen={isOpen} presentingElement={pageRef} swipeToClose onDidDismiss={onClose}>
     <IonHeader>
      <IonToolbar>
          <IonButtons slot='start'>
            {slide===0?
            <IonButton onClick={onClose}>{t('common:actions.cancel')}</IonButton>
            :
            <IonButton onClick={prev}>{t('common:actions.back')}</IonButton>
            }
          </IonButtons>
          <IonTitle>{t('title')}</IonTitle>
          <IonButtons slot='end'>
            {slide===2?
            <IonButton onClick={save}>{t('common:actions.done')}</IonButton>
            :
            <IonButton onClick={next}>{t('common:actions.next')}</IonButton>
            }
          </IonButtons>
      </IonToolbar>
    </IonHeader>
    <IonContent>
      <IonSlides ref={slidesRef} options={{allowSlidePrev: false, allowSlideNext: false, initialSlide: 0}}>
        <IonSlide>
          <Content>
            <ListDivider/>
            <div style={{textAlign: 'justify', margin:'16px'}}>
              <IonLabel>{t('description')}</IonLabel>
            </div>
            <IonList inset>
              <IonItem href='https://www.npmjs.com/package/homebridge' target='_blank'>
                <IonIcon slot='start' icon={homebridge}/>
                <IonLabel>Homebridge</IonLabel>
              </IonItem>
              <IonItem href='https://www.npmjs.com/package/homebridge-http-webhooks' target='_blank'>
                <IonIcon slot='start' icon={logoNpm}/>
                <IonLabel>Homebridge HTTP Webhooks</IonLabel>
              </IonItem>
            </IonList>
            <ListHeader>
              <IonLabel>{t('configuration')}</IonLabel>
            </ListHeader>
            <IonList lines='inset' >
                <IonItem>
                  <IonLabel>{t('url')}</IonLabel>
                  <IonInput value={url} placeholder={t('url_placeholder')} onIonChange={(e)=>setUrl(String(e.detail.value))} />
                </IonItem>
                <IonItem>
                  <IonLabel>{t('prefix')}</IonLabel>
                  <IonInput value={prefix} placeholder={t('prefix')} onIonChange={(e)=>setPrefix(String(e.detail.value))} />
                </IonItem>
            </IonList>
            <ListDivider/>
            <IonButton className='inset' expand='block' color='primary' onClick={next}>
              {t('common:actions.next')}
            </IonButton>
          </Content>
        </IonSlide>
        <IonSlide>
          <IonContent>
            <IonListHeader>
              <IonLabel>{t('trigger')}</IonLabel>
            </IonListHeader>
            <ListHeader>
                <IonLabel>{t('lights:title')}</IonLabel>
            </ListHeader>
            <IonList>
                <ItemSelector 
                items={lights} 
                defaultValue={lightIds} 
                onChange={(value)=>setLightIds(value)} 
                />
            </IonList>
            <ListHeader>
                <IonLabel>{t('groups:title')}</IonLabel>
            </ListHeader>
            <IonList>
                <ItemSelector 
                items={groups} 
                defaultValue={groupIds}
                onChange={(value)=>setGroupIds(value)} 
                />
            </IonList>
            <ListDivider/>
            <IonButton className='inset' expand='block' color='primary' onClick={next}>
              {t('common:actions.next')}
            </IonButton>
            <ListDivider height='80px'/>
          </IonContent>
        </IonSlide>
        <IonSlide>
          <IonContent>
            <ListDivider/>
            <div style={{textAlign: 'left', margin: '16px'}}>
              <p>{t('copy')}</p>
            </div>
            <IonButton className='inset' expand='block' onClick={()=>copyTextToClipboard(config)}>
              <IonIcon slot='start' icon={copy}/>
              {t('common:actions.copy')}
            </IonButton>
            <div style={{textAlign: 'left', margin: '16px', userSelect: 'all', background: 'var(--ion-item-background)'}}>
              <Code
                mode='json'
                value={config}
                readOnly
              />
            </div>
          </IonContent>
        </IonSlide>
      </IonSlides>
    </IonContent>
  </IonModal>
  )
}


