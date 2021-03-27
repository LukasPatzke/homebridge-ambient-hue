import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonLabel, IonGrid, IonRefresher, IonRefresherContent } from '@ionic/react';
import { IGroup, ILightUpdate } from '../types/hue';
import { RouteComponentProps } from 'react-router';
import { chevronBack } from 'ionicons/icons';
import { LightSettings } from '../components/LightSettings';
import { ListHeader } from '../components/ListHeader';
import { LightList } from '../components/LightList';
import { get, put } from '../components/useApi';
import { RefresherEventDetail } from '@ionic/core';
import { LightCurveSettings } from 'src/components/LightCurveSettings';
import { lightReducer } from 'src/utils';

interface IPageGroupDetail extends RouteComponentProps<{
  id: string;
}> {}

const PageGroupDetail : React.FC<IPageGroupDetail> = ({match}) => {
  const [group, setGroup] = useState<IGroup>()
  const { t } = useTranslation(['groups', 'lights']);

  const pageRef = useRef();

  useEffect(()=>{
    get({url: `/groups/${match.params.id}`}).then(setGroup)
  }, [match.params.id])

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    get({url: `/groups/${match.params.id}`}).then(setGroup).then(e.detail.complete)
  }

  const handleChange = (change: ILightUpdate) => {
    put({
      url: `/groups/${match.params.id}`,
      data: change
    }).then(setGroup)
    }

  if (!group) {
    return null;
  } else {
    const light = group.lights.reduce(lightReducer)
    return (
      <IonPage ref={pageRef}>
        <IonHeader translucent>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton routerLink='/groups' routerDirection='back'>
                <IonIcon slot='start' icon={chevronBack} />
                {t('groups:title')}
              </IonButton>
            </IonButtons>
            <IonTitle>{group.name}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent/>
          </IonRefresher>
          <IonGrid fixed>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{group.name}</IonTitle>
            </IonToolbar>
          </IonHeader>
            <ListHeader inset>
              <IonLabel>{t('lights:title')}</IonLabel>
            </ListHeader>
            <LightList lights={group.lights} />
            <ListHeader inset>
              <IonLabel>{t('lights:settings.title')}</IonLabel>
            </ListHeader>
            <LightSettings light={light} onChange={handleChange}/>
            <ListHeader inset>
              <IonLabel>{t('curves:title')}</IonLabel>
            </ListHeader>
            <LightCurveSettings light={light} onChange={handleChange} pageRef={pageRef.current}/>
          </IonGrid>
        </IonContent>
      </IonPage>
    )
  }
}

export default PageGroupDetail;