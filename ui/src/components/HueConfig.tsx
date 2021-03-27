import React, { useRef, useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonSlides, IonSlide, IonContent, IonButton, IonList, IonItem, IonLabel, IonNote, IonIcon, IonInput, IonSpinner, IonItemDivider, IonButtons } from '@ionic/react';
import { Content } from './Content';
import { IBridgeDiscovery, IBridgeSync, IBridge } from 'src/types/hue';
import { get, post } from './useApi';
import  devicesBridgesV2 from '../icons/hue/devicesBridgesV2.svg';
import { ListHeader } from './ListHeader';
import { SpinnerCircularSplit } from 'spinners-react';
import { useTranslation } from 'react-i18next';

interface IHueConfigProps {
  isOpen: boolean
  onAbbort?: ()=>void
  onFinish: (newBridge: Promise<IBridge>)=>void
}

type state = 'loading'|'success'|'failure'

export const HueConfig: React.FC<IHueConfigProps> = ({isOpen, onAbbort, onFinish}) => {
  const slidesRef = useRef<HTMLIonSlidesElement>(null);
  const inputRef = useRef<HTMLIonInputElement>(null)

  const [isDiscoveryLoading, setDiscoveryLoading] = useState(true)
  const [discovered, setDiscovered] = useState<IBridgeDiscovery[]>([])
  const [connectionState, setConnectionState] = useState<state>('loading')
  const [result, setResult] = useState<IBridgeSync>()

  const { t } = useTranslation(['common', 'settings']);

  useEffect(()=>{
    get({url: '/bridge/discover'}).then(data=>{
      setDiscovered(data)
      setDiscoveryLoading(false)
    })
  }, [])

  const finish = () => {
    onFinish(get({url: '/bridge/'}))
  }

  const next = () => {
    slidesRef.current?.lockSwipeToNext(false);
    slidesRef.current?.slideNext();
    slidesRef.current?.lockSwipeToNext(true);
  }

  const prev = () => {
    slidesRef.current?.lockSwipeToPrev(false);
    slidesRef.current?.slidePrev();
    slidesRef.current?.lockSwipeToPrev(true);
    setConnectionState('loading')
  }

  const submit = (ipaddress: string) => {
    next()
    post({
      url: '/bridge/',
      data: {ipaddress: ipaddress}
    }).then(data=>{
      setResult(data)
      setConnectionState('success')
    }).catch(error=>{
      setConnectionState('failure')
    })
  }

  const discoveredBridges = discovered.map((item, index)=>(
    <IonItem key={index} button onClick={()=>submit(item.internalipaddress)}>
      <IonIcon color='primary' slot='start' icon={devicesBridgesV2}/> 
      <IonLabel>
        {item.name||'Hue Bridge'}
        <IonNote>{item.internalipaddress}</IonNote>
      </IonLabel>
    </IonItem>
  ))

  return (
    <IonModal isOpen={isOpen}>
      <IonContent>
      <IonSlides ref={slidesRef} options={{allowSlidePrev: false, allowSlideNext: false, initialSlide: 0}}>
        <IonSlide>
          <Content>
            <IonHeader>
              <IonToolbar className='transparent'>
                {onAbbort?
                <IonButtons slot='primary'>
                  <IonButton onClick={onAbbort} >
                    {t('common:actions.cancel')}
                  </IonButton>
                </IonButtons>
                :undefined}
              </IonToolbar>
            </IonHeader>
            <div style={{height: '40px'}}/>
            <h1>{t('settings:init.1.title')}</h1>
            <IonItemDivider/>
            <ListHeader>
              <IonLabel>{t('settings:init.1.autoconfig')}</IonLabel>
            </ListHeader>
            <IonList>
              {discoveredBridges}
              {discoveredBridges.length===0 && !isDiscoveryLoading?
                <IonItem>
                  <IonLabel>{t('common:init.1.noresults')}</IonLabel>
                </IonItem>
              :undefined}
              {isDiscoveryLoading?
                <IonItem>
                  <IonSpinner slot='start'/>
                  <IonLabel>{t('common:state.loading')}</IonLabel>
                </IonItem>
              :undefined}
            </IonList>
            <div style={{height: '1.5em'}}/>
            <ListHeader>
              <IonLabel>{t('settings:init.1.manualconfig')}</IonLabel>
            </ListHeader>
            <IonList>
              <IonItem>
                <IonLabel>IP Address</IonLabel>
                <IonInput ref={inputRef} placeholder='192.168.178.23'/>
                <IonButton 
                  slot='end'
                  fill='clear'
                  size='default'
                  onClick={()=>{if(inputRef.current?.value) {submit(inputRef.current?.value as string)}}}
                >
                  {t('common:actions.next')}
                </IonButton>
              </IonItem>
            </IonList>
            <div style={{height: '1.5em'}}/>
          </Content>
        </IonSlide>
        <IonSlide>
          <Content>
            <div style={{height: '40px'}}/>
            <h1 style={{minHeight: '2.4em'}}>{t(`settings:init.2.${connectionState}`)}</h1>
            <Icon state={connectionState}/>
            <div style={{height: '3em'}}>
              <IonLabel>
                {connectionState==='success'?t('settings:init.2.found', result):undefined}
              </IonLabel>
            </div>
            {connectionState==='loading'?<IonButton onClick={prev} color='medium'>{t('common:actions.cancel')}</IonButton>:undefined}
            {connectionState==='success'?<IonButton onClick={finish} color='primary'>{t('common:actions.done')}</IonButton>:undefined}
            {connectionState==='failure'?<IonButton onClick={prev} color='primary'>{t('common:actions.back')}</IonButton>:undefined}
          </Content>
        </IonSlide>
      </IonSlides>
      </IonContent>
    </IonModal>
  )
}



interface IIconProps {
  state: state
}

interface IOptions {
  ionColor: string
  color: string
  secondaryColor: string
  enabled: boolean
}

const Icon: React.FC<IIconProps> = ({state}) => {
  var options: IOptions;
  if (state==='loading') {
    options = {
      ionColor: 'primary',
      color: 'var(--ion-color-primary)',
      // secondaryColor: '#f4f5f8',
      secondaryColor: 'var(--ion-color-step-200)',
      enabled: true
    }
  } else if (state==='success') {
    options = {
      ionColor: 'success',
      color: 'var(--ion-color-success)',
      secondaryColor: 'var(--ion-color-success)',
      enabled: true
    }
  } else if (state==='failure') {
    options = {
      ionColor: 'danger',
      color: 'var(--ion-color-danger)',
      secondaryColor: 'var(--ion-color-danger)',
      enabled: true
    }
  } else {
    options = {
      ionColor: 'medium',
      color: 'var(--ion-color-medium)',
      secondaryColor: 'var(--ion-color-medium)',
      enabled: true
    }
  }
  return (
    <div className='lp-spinner'>
      <IonIcon 
        color={options.ionColor}
        style={{fontSize: 140}} 
        icon={devicesBridgesV2}
      /> 
      <SpinnerCircularSplit 
        size={256} 
        thickness={75} 
        speed={50}
        color={options.color}
        secondaryColor={options.secondaryColor}
        enabled={options.enabled}
      />
    </div>
  )
}