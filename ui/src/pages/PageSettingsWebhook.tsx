import React, { useRef, useState, useEffect } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonItem, IonLabel, IonList, IonButtons, IonButton, IonIcon, IonToggle, IonSegment, IonSegmentButton, IonModal, IonInput, IonItemSliding, IonItemOptions, IonItemOption, IonRefresher, IonRefresherContent, IonListHeader, IonCheckbox } from '@ionic/react';
import { IWebHook, method, ILight, IGroup, ILightInfo, IGroupInfo, IWebhookUpdate } from 'src/types/hue';
import { get, post, put, del } from 'src/components/useApi';
import { useTranslation } from 'react-i18next';
import { chevronBack, add, addCircle } from 'ionicons/icons';
import { ListHeader } from 'src/components/ListHeader';
import { ListDivider } from 'src/components/ListDivider';
import { RefresherEventDetail, CheckboxChangeEventDetail } from '@ionic/core';
import { ItemIcon } from 'src/components/LightList';
import { ListFooter } from 'src/components/ListFooter';
import AceEditor, { IAceEditorProps } from 'react-ace';
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-dracula";
import CustomTextMode from '../theme/mode-ambienthue';
import CustomJsonMode from '../theme/mode-ambienthue-json';

interface IModalState {
  isOpen: boolean
  isNew?: boolean
  webhook?: IWebHook
}

const PageWebhook: React.FC = () => {
  const [webhooks, setWebhooks] = useState<IWebHook[]>([])
  const [modalState, setModalState] = useState<IModalState>({isOpen: false, isNew: true, webhook: undefined})
  const { t } = useTranslation(['common', 'webhooks'])

  const pageRef = useRef();
  const customsListRef = useRef<HTMLIonListElement>(null); 

  useEffect(()=>{
    get({url: '/webhooks/'}).then(setWebhooks)
  }, [])

  const update = () => (
    get({url: '/webhooks/'}).then(setWebhooks)
  )

  const handleDelete = (webhook: IWebHook) => {
    del({
      url: `/webhooks/${webhook.id}`
    }).then(update).then(()=>{
      if (customsListRef.current) {
        customsListRef.current.closeSlidingItems()
      }
    })
  }

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    update().then(e.detail.complete)
  }

  const items = webhooks.map((webhook, index)=>(
    <IonItemSliding key={index}>
      <IonItem key={index} button onClick={()=>setModalState({isOpen: true, isNew: false, webhook: webhook})}>
        <IonLabel>{webhook.name}</IonLabel>
      </IonItem>
      <IonItemOptions slot='end'>
        <IonItemOption onClick={()=>handleDelete(webhook)} color='danger'>{t('common:actions.delete')}</IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  ))

  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink='/settings' routerDirection='back'>
              <IonIcon slot='start' icon={chevronBack} />
              {t('settings:title')}
            </IonButton>
          </IonButtons>
          <IonTitle>{t('webhooks:title')}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={()=>setModalState({isOpen: true, isNew: true})} >
              <IonIcon slot='icon-only' icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent/>
        </IonRefresher>
        <IonGrid fixed>
        <IonHeader collapse='condense'>
          <IonToolbar>
            <IonTitle size='large'>{t('webhooks:title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList ref={customsListRef} inset>
          {items}
        </IonList>
        <IonButton className='inset primary translucent' expand='block' onClick={()=>setModalState({isOpen: true, isNew: true})} >
        <IonIcon slot='start' icon={addCircle} color='primary'/>
      <IonLabel color='primary'>{t('common:actions.add')}</IonLabel>
        </IonButton>
        </IonGrid>
      </IonContent>
      <WebhookModal 
        {...modalState} 
        onChange={()=>update().then(()=>setModalState({isOpen: false}))}
        onClose={()=>setModalState({isOpen: false})} 
        pageRef={pageRef.current}
      />
    </IonPage>
  )
}

export default PageWebhook

interface IWebhookModalProps {
  isOpen: boolean;
  onClose: ()=>void;
  onChange: ()=>void;
  pageRef?: HTMLElement;
  webhook?: IWebHook;
  isNew?: boolean
}

const defaultWebhookItem = {
  body: '{}', 
  method:'GET', 
  lights:[] as ILightInfo[], 
  groups:[] as IGroupInfo[],  
  on:true
} as IWebHook


const WebhookModal: React.FC<IWebhookModalProps> = ({
  isOpen, onClose, onChange, pageRef, webhook=defaultWebhookItem, isNew}) => {
  const [lights, setLights] = useState<ILight[]>([])
  const [groups, setGroups] = useState<IGroup[]>([])
  const [lightIds, setLightIds] = useState(webhook.lights.map(l=>l.id))
  const [groupIds, setGroupIds] = useState(webhook.groups.map(g=>g.id))
  const { t, } = useTranslation(['webhooks', 'common']);


  useEffect(()=>{
    get({url: '/lights/'}).then(setLights)
    get({url: '/groups/'}).then(setGroups)
  }, [])

  useEffect(()=>{
    setLightIds(webhook.lights.map(l=>l.id))
    setGroupIds(webhook.groups.map(g=>g.id))
  }, [webhook])


  const save = () => {
    const data = {
      ...webhook,
      lights: lightIds,
      groups: groupIds
    } as IWebhookUpdate
    if (webhook.id) {
      put({
        url: `/webhooks/${webhook.id}`,
        data: data
      }).then(onChange)
    } else {
      post({
        url: `/webhooks/`,
        data: data
      }).then(onChange)
    }
  }

  return (
    <IonModal isOpen={isOpen} presentingElement={pageRef} swipeToClose onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot='start'>
            <IonButton onClick={onClose}>{t('common:actions.cancel')}</IonButton>
          </IonButtons>
          <IonTitle>{t(isNew?'create':'edit')}</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={save}>{t('common:actions.done')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <ListDivider/>
        <IonList lines='inset' >
          <IonItem>
            <IonLabel>{t('name')}</IonLabel>
            <IonInput value={webhook.name} placeholder={t('name')} onIonChange={(e)=>webhook.name = String(e.detail.value)} />
          </IonItem>
          <IonItem>
            <IonLabel>{t('on')}</IonLabel>
            <IonToggle checked={webhook.on} onIonChange={(e)=>webhook.on = e.detail.checked} />
          </IonItem>
        </IonList>
        <ListDivider/>
        <IonList>
          <IonItem>
            <IonLabel>{t('method')}</IonLabel>
            <IonSegment color='primary' value={webhook.method} onIonChange={(e)=>webhook.method=e.detail.value as method}>
              <IonSegmentButton value='GET'>GET</IonSegmentButton>
              <IonSegmentButton value='POST'>POST</IonSegmentButton>
            </IonSegment>
          </IonItem>
        </IonList>
        <ListHeader><IonLabel>{t('url')}</IonLabel></ListHeader>
        <IonList>
          <IonItem>
            <Code
              customMode={CustomTextMode}
              defaultValue={webhook.url}
              placeholder='http://example.com/path'
              onChange={(value)=>webhook.url=value}
              wrapEnabled
            />
          </IonItem>
        </IonList>
        <ListHeader><IonLabel>{t('body')}</IonLabel></ListHeader>
        <IonList>
          <IonItem>
            <Code
              customMode={CustomJsonMode}
              defaultValue={webhook.body}
              onChange={(value)=>webhook.body=value}
            />
          </IonItem>
        </IonList>
        <ListFooter>
          <IonLabel>
            {t('params.description')}
            <ul>
              <li>{`{item}: ${t('params.item')}`}</li>
              <li>{`{id}: ${t('params.id')}`}</li>
              <li>{`{name}: ${t('params.name')}`}</li>
              <li>{`{type}: ${t('params.type')}`}</li>
              <li>{`{on}: ${t('params.on')}`}</li>
            </ul>
          </IonLabel>
        </ListFooter>
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
        <ListDivider height='80px'/>
      </IonContent>
    </IonModal>
  )
}


type IItem = ILight | ILightInfo | IGroup | IGroupInfo

interface  IItemSelector {
  items: (IItem)[]
  defaultValue: number[]
  onChange: (value: number[])=>void
}

export const ItemSelector: React.FC<IItemSelector> = ({items, defaultValue, onChange}) => {
  
  const handleClick = (clicked: IItem, e: CustomEvent<CheckboxChangeEventDetail>) => {
    if (e.detail.checked) {
      onChange([...defaultValue, clicked.id])
    } else {
      onChange(defaultValue.filter(i=>i!==clicked.id))
    }
  }
  
  const listItems = items.map((item: IItem, index:number) => (
    <IonItem key={index}>
      <ItemIcon slot='start' item={item}/>
      <IonLabel>{item.name}</IonLabel>
      <IonCheckbox 
        slot='end' color='primary' 
        checked={defaultValue.includes(item.id)} 
        onIonChange={(e)=>handleClick(item, e)}/>
    </IonItem>
  ))
  
  return (
    <IonList>
      {listItems}
    </IonList>
  )
}



interface ICodeProps extends IAceEditorProps {
  customMode?: any
}

export const Code: React.FC<ICodeProps> = ({customMode, ...props}) => {
  const ref = useRef<AceEditor>(null);

  useEffect(()=>{
    if (customMode) {
      const customModeInstance = new customMode();
      ref.current?.editor.getSession().setMode(customModeInstance as any)
    }
  })

  return (
    <AceEditor
      ref={ref}
      theme={window.matchMedia('(prefers-color-scheme: dark)').matches?'dracula':'github'}
      fontSize='1em'
      width='100%'
      maxLines={Infinity}
      highlightActiveLine={false}
      showGutter={false}
      {...props}
    />
  )
}