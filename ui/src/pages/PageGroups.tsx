import  React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRefresher, IonRefresherContent, useIonViewWillEnter } from '@ionic/react';
import { IGroup } from '../types/hue';
import { useTranslation } from 'react-i18next';
import { GroupList } from '../components/GroupList';
import { get } from '../components/useApi';
import { RefresherEventDetail } from '@ionic/core';

const PageGroups: React.FC = () => {
  const [groups, setGroups] = useState<IGroup[]>([]);
  const { t } = useTranslation('groups');

  useIonViewWillEnter(()=>{
    update()
  })

  const update = () => (
    get({url: '/groups/'}).then(setGroups)
  )

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    update().then(()=>e.detail.complete())
  }

  return (
    <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{t('title')}</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
            <IonRefresherContent/>
          </IonRefresher>
          <IonGrid fixed>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{t('title')}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <GroupList groups={groups}/>
          </IonGrid>
        </IonContent>
      </IonPage>
  )
}

export default PageGroups;