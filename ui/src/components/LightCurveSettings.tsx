import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonList, IonLabel, IonIcon, IonItem, IonNote, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonBadge, IonSlides, IonSlide, IonContent } from '@ionic/react';
import { ILight, ILightUpdate, ICurve, Curvekind } from '../types/hue';
import { checkmark, chevronBack, addCircle } from 'ionicons/icons';
import { isLightCtControlled, isLightBriControlled } from './LightList';
import { Content } from './Content';
import { get } from './useApi';
import { ListDivider } from './ListDivider';
import { CurveDetail } from 'src/pages/PageCurveDetail';
import { CreateCurve } from '../pages/PageCurves';


interface ILightCurveSettingsProps {
  light: ILight;
  onChange: (change: ILightUpdate) => void;
  pageRef?: HTMLElement;
}

export const LightCurveSettings: React.FC<ILightCurveSettingsProps> = ({light, onChange, pageRef}) => {
  const [isCtModalOpen, setCtModalOpen] = useState(false);
  const [isBriModalOpen, setBriModalOpen] = useState(false);

  const { t } = useTranslation('curves');

  if (!isLightCtControlled(light) && !isLightBriControlled(light)) {
    return null
  }
  
  return (
    <IonList inset>
      {isLightBriControlled(light)?
      <IonItem button onClick={()=>setBriModalOpen(true)}>
        <IonLabel>{t('default_names.bri')}</IonLabel>
        <IonNote slot='end'>{light.brightnessCurve?light.brightnessCurve.name:t('defaults')}</IonNote>
      </IonItem>
      :undefined}
      {isLightCtControlled(light)?
      <IonItem button onClick={()=>setCtModalOpen(true)}>
        <IonLabel>{t('default_names.ct')}</IonLabel>
        <IonNote slot='end'>{light.colorTemperatureCurve?light.colorTemperatureCurve.name:t('defaults')}</IonNote>
      </IonItem>
      :undefined}
      <CurveSettings 
        isOpen={isCtModalOpen}
        kind='ct'
        defaultValue={light.colorTemperatureCurve}
        onClose={()=>setCtModalOpen(false)}
        onSelect={(change)=>{onChange(change);setCtModalOpen(false)}}
        pageRef={pageRef}
      />
      <CurveSettings 
        isOpen={isBriModalOpen}
        kind='bri'
        defaultValue={light.brightnessCurve}
        onClose={()=>setBriModalOpen(false)}
        onSelect={(change)=>{onChange(change);setBriModalOpen(false)}}
        pageRef={pageRef}
      />
    </IonList>
  )
}

interface ICurveSettingsProps {
  isOpen: boolean;
  kind: Curvekind;
  defaultValue?: ICurve;
  onClose: ()=>void;
  onSelect: (change: ILightUpdate) => void;
  pageRef?: HTMLElement;
}

const CurveSettings: React.FC<ICurveSettingsProps> = ({isOpen, kind, defaultValue, onClose, onSelect, pageRef}) => {
  const slidesRef = useRef<HTMLIonSlidesElement>(null);
  const modalRef = useRef<HTMLIonModalElement>(null);
  
  const { t } = useTranslation(['common', 'curves']);
  const [curves, setCurves] = useState<ICurve[]>([]);
  const [selected, setSelected] = useState<ICurve|undefined>(defaultValue)
  const [isDetail, setDetail] = useState(false)
  const [isCreate, setCreate] = useState(false)


  useEffect(()=>{
    get({url: `/curves?kind=${kind}`}).then(setCurves)
  }, [kind])

  useEffect(()=>{
    if (!defaultValue) {
      setSelected(curves.filter(c=>c.default)[1])
    }
  }, [defaultValue, curves, isOpen])

  const update = () => (
    get({url: `/curves?kind=${kind}`}).then(setCurves)
  )

  const handleSelect = () => {
    if (kind==='bri') {
      onSelect({brightnessCurveId: selected?.id})
    } else if (kind==='ct') {
      onSelect({colorTemperatureCurveId: selected?.id})
    }
  }

  const handleEdit = (curve: ICurve) => {
    setSelected(curve)
    setDetail(true)
    next()
  }

  const handleBack = () => {
    setDetail(false)
    prev()
  }

  const next = () => {
    slidesRef.current?.lockSwipeToNext(false);
    slidesRef.current?.slideNext();
    slidesRef.current?.lockSwipeToNext(true);
    slidesRef.current?.lockSwipeToPrev(false);
  }

  const prev = () => {
    slidesRef.current?.lockSwipeToPrev(false);
    slidesRef.current?.slidePrev();
    slidesRef.current?.lockSwipeToPrev(true);

  }

  const curveItems = curves.map((curve, index)=>(
    <IonItem 
      key={index} button
      onClick={()=>handleEdit(curve)}
    >
      <IonLabel>{curve.name}</IonLabel>
      {curve.default?<IonBadge color='medium'>default</IonBadge>:undefined}
      <IonIcon slot='end' color='primary' icon={curve.id === selected?.id?checkmark:undefined} />
    </IonItem>
  ))
  return (
    <IonModal ref={modalRef} isOpen={isOpen} presentingElement={pageRef} canDismiss onDidDismiss={onClose} >
      <IonHeader>
        <IonToolbar>
          {isDetail?
          <IonButtons slot='start'>
            <IonButton onClick={handleBack}>
              <IonIcon slot='start' icon={chevronBack} />
              {t('common:actions.back')}
            </IonButton>
          </IonButtons>
          :undefined}
          <IonTitle>{t('curves:title')}</IonTitle>
          <IonButtons slot='end'>
            <IonButton onClick={handleSelect}>{t('common:actions.done')}</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <IonSlides 
        ref={slidesRef} 
        options={{allowSlidePrev: false, allowSlideNext: false, initialSlide: 0}}
        onIonSlideReachStart={()=>{slidesRef.current?.lockSwipeToPrev(true);setDetail(false)}}
      >
        <IonSlide>
            <Content>
            <ListDivider/>
            <IonList lines='inset' >
              {curveItems}
            </IonList>
            <ListDivider/>
            <IonButton className='inset primary translucent' expand='block' onClick={()=>setCreate(true)}>
              <IonIcon slot='start' icon={addCircle} color='primary'/>
              <IonLabel color='primary'>{t('common:actions.add')}</IonLabel>
            </IonButton>
            </Content>
        </IonSlide>
        <IonSlide>
          <Content>
          {selected?
            <CurveDetail 
              id={selected.id} 
              embedded 
              embeddedRef={modalRef.current as HTMLElement}
              onDelete={()=>update().then(()=>handleBack())}
            />
            :undefined}
          </Content>
        </IonSlide>
      </IonSlides>
      </IonContent>
      <CreateCurve 
        isOpen={isCreate} 
        pageRef={modalRef.current as HTMLElement} 
        fixedKind={kind}
        onClose={(curve)=>{
          if (curve) {
            update().then(()=>{
              setCreate(false)
              handleEdit(curve)
              
            })
          } else {
            setCreate(false)
          }
        }}
      />
    </IonModal>
  )
}
