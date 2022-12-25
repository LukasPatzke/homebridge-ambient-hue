import { IonButton, IonButtons, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { chevronBackCircle, chevronForwardCircle } from 'ionicons/icons';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSwipeable } from 'react-swipeable';
import { formatMinutes } from './Chart';
import { Content } from './Content';

interface IChartModalProps {
  isOpen: boolean;
  onClose: ()=>void;
  pageRef?: HTMLElement;
  title: string;
  children?: React.ReactNode;
}
export const ChartModal: React.FC<IChartModalProps> = ({isOpen, onClose, pageRef, children, title}) => {
  const [xScale, setXScale] = useState({min:360, max:1080});
  const { t } = useTranslation('common');
  const swipeHandlers = useSwipeable({
    onSwipedRight: ()=>{if (xScale.min>0) {setXScaleOffset(-360)}},
    onSwipedLeft: ()=>{if (xScale.max<1440) {setXScaleOffset(360)}}
  })

  const setXScaleOffset = (offset:number) => {
    const min = xScale.min + offset;
    const max = xScale.max + offset;
    if ((min>=0) && (max<=1440)) {
      setXScale({
        min: min,
        max: max
      })
    }
  }

  return (
    <IonModal isOpen={isOpen} canDismiss presentingElement={pageRef} onDidDismiss={onClose}>
      <IonHeader>
          <IonToolbar>
            <IonTitle>{title}</IonTitle>
            <IonButtons slot='primary'>
              <IonButton onClick={onClose}>{t('actions.done')}</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <Content>
          {React.Children.map(children, child=>(
            React.cloneElement(child as React.ReactElement<any> , {
              xScale: xScale, 
              setXScaleOffset: setXScaleOffset, 
              expanded: true,
              swipeConfig: {
                onSwipingLeft: ()=>{if (xScale.max<1440) {setXScaleOffset(360)}},
                onSwipingRight: ()=>{if (xScale.min>0) {setXScaleOffset(-360)}},
                onSwipedDown: onClose,
              },
            })
          ))}
        </Content>
        <IonFooter>
          <IonToolbar>
          <IonItem lines='none' {...swipeHandlers}>
            <IonLabel style={{textAlign: 'center'}}>{`${formatMinutes(xScale.min)} - ${formatMinutes(xScale.max)}`}</IonLabel>
            <IonButton onClick={()=>setXScaleOffset(-360)} disabled={xScale.min===0} fill='clear' slot='start'>
              <IonIcon slot='icon-only' icon={chevronBackCircle}/>
            </IonButton>
            <IonButton onClick={()=>setXScaleOffset(360)} disabled={xScale.max===1440} fill='clear' slot='end'>
              <IonIcon slot='icon-only' icon={chevronForwardCircle}/>
            </IonButton>
          </IonItem>
          </IonToolbar>
        </IonFooter>
    </IonModal>
  )
}
