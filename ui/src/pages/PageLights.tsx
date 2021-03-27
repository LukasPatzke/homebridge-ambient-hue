import  React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRefresher, IonRefresherContent, useIonViewWillEnter } from '@ionic/react';
import { LightList } from '../components/LightList';
import { ILight } from '../types/hue';
import { get } from '../components/useApi';
import { RefresherEventDetail } from '@ionic/core';


const PageLights: React.FC = () => {
  const [lights, setLights] = useState<ILight[]>([]);
  const { t } = useTranslation('lights');

  useIonViewWillEnter(()=>{
    update()
  })

  const update = () => (
    get({url: '/lights/'}).then(setLights)
  )

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    update().then(e.detail.complete)
  }

  return (
    <IonPage>
        <IonHeader translucent>
          <IonToolbar>
            <IonTitle>{t('title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent/>
          </IonRefresher>
          <IonGrid fixed >
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{t('title')}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <LightList lights={lights}/>
          </IonGrid>
        </IonContent>
      </IonPage>
  )
}

export default PageLights;