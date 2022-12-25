import  React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonList, IonItem, IonLabel, IonButtons, IonButton, IonIcon, IonModal, IonSegment, IonSegmentButton, IonInput, IonBadge, IonItemSliding, IonItemOptions, IonItemOption, IonRefresher, IonRefresherContent, useIonViewWillEnter } from '@ionic/react';
import { get, post, del } from '../components/useApi';
import { ListHeader } from 'src/components/ListHeader';
import { remove, add, addCircle } from 'ionicons/icons';
import { Content } from 'src/components/Content';
import { Curvekind, ICurve } from 'src/types/hue';
import { useHistory } from 'react-router';
import { RefresherEventDetail } from '@ionic/core';
import { briCurve, ctCurve } from 'src/dummies';

interface IPageCurvesProps {
}
const PageCurves: React.FC<IPageCurvesProps> = () => {
  const [curves, setCurves] = useState<ICurve[]>([briCurve, ctCurve])
  const { t } = useTranslation(['curves', 'common']);
  const pageRef = useRef();


  useIonViewWillEnter(()=>{
    update()
  })

  const update = () => (
    get({url: '/curves'}).then(setCurves)
  )

  const handleDelete = (curve: ICurve) => (
    del({url: `/curves/${curve.id}`}).then(update)
  )

  const handleChange = () => (update())

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    update().then(e.detail.complete)
  }
  
  return (
    <IonPage ref={pageRef}>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>{t('curves:title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent/>
          </IonRefresher>
          <IonGrid fixed >
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{t('curves:title')}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <CurveList curves={curves} onDelete={handleDelete} onChange={handleChange} pageRef={pageRef.current}/>
          </IonGrid>
        </IonContent>
      </IonPage>
  )
}

interface ICurveListProps {
  curves: ICurve[]
  onDelete: (curve: ICurve)=>Promise<void>
  onChange: ()=>Promise<void>
  pageRef?: HTMLElement
}

const CurveList: React.FC<ICurveListProps> = ({pageRef, onDelete, onChange, curves}) => {
  
  const [isModalOpen, setModalOpen] = useState(false);
  const { t } = useTranslation(['common', 'curves']);
  
  const customsListRef = useRef<HTMLIonListElement>(null);  

  const handleDelete = (curve: ICurve) => {
    onDelete(curve).then(()=>{
      if (customsListRef.current) {
        customsListRef.current.closeSlidingItems()
      }
    })
  }

  const defaults = curves.filter(curve=>curve.default).map((curve, index)=>(
    <IonItem routerLink={`/curves/${curve.id}`} routerDirection='forward' key={index}>
      <IonLabel>{t(`curves:default_names.${curve.kind}`)}</IonLabel>
      <CurveTypeBadge curve={curve}/>
    </IonItem>
  ))

  const customs = curves.filter(curve=>!curve.default).map((curve, index)=>(
    <IonItemSliding key={index}>
      <IonItem routerLink={`/curves/${curve.id}`} routerDirection='forward' >
        <IonLabel>{curve.name}</IonLabel>
        <CurveTypeBadge curve={curve}/>
      </IonItem>
      <IonItemOptions slot='end'>
        <IonItemOption onClick={()=>handleDelete(curve)} color='danger'>{t('common:actions.delete')}</IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
    
  ))
  
  return (
    <>
    <ListHeader>
      <IonLabel>{t('curves:defaults')}</IonLabel>
    </ListHeader>
    <IonList inset>
      {defaults}
    </IonList>
    <ListHeader>
      <IonLabel>{t('curves:custom')}</IonLabel>
    </ListHeader>
    <IonList ref={customsListRef} inset>
      {customs}
    </IonList>
    <IonButton className='inset primary translucent' expand='block' onClick={()=>setModalOpen(true)}>
      <IonIcon slot='start' icon={addCircle} color='primary'/>
      <IonLabel color='primary'>{t('common:actions.add')}</IonLabel>
    </IonButton>
    <CreateCurve isOpen={isModalOpen} redirect onClose={()=>onChange().then(()=>setModalOpen(false))} pageRef={pageRef}/>
    </>
  )
}

interface IBadgeProps {
  curve: ICurve
}

export const CurveTypeBadge: React.FC<IBadgeProps> = ({curve}) => {
  const { t } = useTranslation(['common', 'curves']);
  let color = ''
  if (curve.kind==='bri') {
    color = 'light'
  } else if (curve.kind==='ct') {
    color = 'warning'
  } if (curve.kind==='hue') {
    color = 'primary'
  } if (curve.kind==='sat') {
    color = 'dark'
  } 
  return (
    <IonBadge color={color}>
      {t(`curves:default_names.${curve.kind}`)}
    </IonBadge>
  )
}

export default PageCurves;


interface ICreateCurveProps {
  isOpen: boolean;
  onClose: (curve?: ICurve)=>void;
  pageRef?: HTMLElement | HTMLIonModalElement;
  fixedKind?:Curvekind;
  redirect?:boolean
}

export const CreateCurve: React.FC<ICreateCurveProps> = ({isOpen, onClose, pageRef, fixedKind, redirect}) => {
  const { t } = useTranslation(['common', 'curves']);
  const [kind, setKind] = useState<Curvekind>(fixedKind || 'bri')
  const [name, setName] = useState<string|null>()
  const [count, setCount] = useState(2);
  
  let history = useHistory();
  
  return (
    <IonModal isOpen={isOpen} presentingElement={pageRef} canDismiss onDidDismiss={()=>onClose()}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{t('curves:create.title')}</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={()=>onClose()}>{t('common:actions.cancel')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Content>
        <div style={{height: '30px'}}/>
        <IonList lines='inset' >
          {!fixedKind?
          <IonItem>
            <IonSegment color='primary' value={kind} onIonChange={(e)=>setKind(e.detail.value as Curvekind)}>
              <IonSegmentButton value='bri'>{t('curves:default_names.bri')}</IonSegmentButton>
              <IonSegmentButton value='ct'>{t('curves:default_names.ct')}</IonSegmentButton>
            </IonSegment>
          </IonItem>
          :undefined}
          <IonItem>
            <IonLabel slot='start'>{t('curves:create.name')}</IonLabel>
            <IonInput value={name} onIonChange={(e)=>setName(e.detail.value)} placeholder={t('curves:create.name')}/>
          </IonItem>
          <IonItem>
            <IonLabel slot='start'>{t('curves:create.point_count')}</IonLabel>
              <IonButton slot='end' disabled={count<=2} onClick={()=>setCount(count-1)}>
                <IonIcon slot='icon-only' icon={remove} />
              </IonButton>
              <IonInput slot='end' style={{maxWidth: '40px', textAlign: 'center'}} min='2' step='1' type='number' value={count} onIonChange={(e)=>setCount(parseInt(e.detail.value || '2'))}/>
              <IonButton slot='end' onClick={()=>setCount(count+1)}>
                <IonIcon slot='icon-only' icon={add} />
              </IonButton>
          </IonItem>
        </IonList>
        <div style={{height: '50px'}}/>
        <IonButton className='inset primary translucent' expand='block' disabled={name?false:true} onClick={()=>{
          post({
            url: '/curves',
            data: {kind: kind, name: name, count: count}
          }).then((data:ICurve)=>{
            if (redirect) {
              history.push(`/curves/${data.id}`)
            }
            onClose(data)
          })
        }}>
          <IonIcon slot='start' icon={addCircle} color='primary'/>
          <IonLabel color='primary'>{t('common:actions.add')}</IonLabel>
        </IonButton>
      </Content>
    </IonModal>
  )
}