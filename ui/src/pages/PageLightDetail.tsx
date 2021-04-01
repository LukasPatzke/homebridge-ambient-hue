import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonLabel, IonButton, IonIcon, IonGrid, IonRefresher, IonRefresherContent } from '@ionic/react';
import { ILight, ILightUpdate } from '../types/hue';
import { RouteComponentProps } from 'react-router';
import { chevronBack } from 'ionicons/icons';
import { ListHeader } from '../components/ListHeader';
import { LightSettings } from '../components/LightSettings';
import { LightInfos } from '../components/LightInfos';
import { get, patch } from '../components/useApi';
import { LightCurveSettings } from 'src/components/LightCurveSettings';
import { RefresherEventDetail } from '@ionic/core';

interface ILightDetailProps extends RouteComponentProps<{
  id: string;
}> {}

const PageLightDetail : React.FC<ILightDetailProps> = ({match}) => {
  const [light, setLight] = useState<ILight>()
  const { t } = useTranslation(['lights', 'curves']);

  const pageRef = useRef();

  useEffect(()=>{
    get({url: `/lights/${match.params.id}`}).then(setLight)
  }, [match.params.id])

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    get({url: `/lights/${match.params.id}`}).then(setLight).then(e.detail.complete)
  }

  const onChange = (change: ILightUpdate) => {
    patch({
      url: `/lights/${match.params.id}`,
      data: change
    }).then(setLight)
  }

  if (!light) {
    return null;
  } else {
    return (
      <IonPage ref={pageRef}>
        <IonHeader translucent>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink='/lights' routerDirection='back'>
                <IonIcon slot='start' icon={chevronBack} />
                {t('lights:title')}
              </IonButton>
            </IonButtons>
            <IonTitle>{light.name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent/>
          </IonRefresher>
          <IonGrid fixed>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">{light.name}</IonTitle>
              </IonToolbar>
            </IonHeader>
            <LightSettings light={light} onChange={onChange}/>
            <ListHeader inset>
              <IonLabel>{t('curves:title')}</IonLabel>
            </ListHeader>
            <LightCurveSettings light={light} onChange={onChange} pageRef={pageRef.current}/>
            <ListHeader inset>
              <IonLabel>{t('lights:info.title')}</IonLabel>
            </ListHeader>
            <LightInfos light={light}/>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }
}

export default PageLightDetail;