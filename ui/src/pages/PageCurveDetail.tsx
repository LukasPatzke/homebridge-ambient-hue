import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonLabel, IonButton, IonIcon, IonGrid, IonList, IonAlert, IonItem, IonNote, IonRefresher, IonRefresherContent } from '@ionic/react';
import { RouteComponentProps, useHistory } from 'react-router';
import { chevronBack, sunny, chevronUp  } from 'ionicons/icons';
import { Chart, IChange, IOnChange } from 'src/components/Chart';
import { ChartModal } from '../components/ChartModal';
import { get, post, put, del } from '../components/useApi';
import { Range } from '../components/Range';
import { HapticsImpactStyle, useHaptics } from '../components/useHaptics';
import { debounce } from 'lodash';
import { ListFooter } from 'src/components/ListFooter';
import { CurveTypeBadge } from './PageCurves';
import { RefresherEventDetail } from '@ionic/core';
import { ICurve } from 'src/types/hue';

interface IPageCurveDetailProps extends RouteComponentProps<{
  id: string;
}> {}

const PageCurveDetail: React.FC<IPageCurveDetailProps> = ({match}) => (
  <CurveDetail id={parseInt(match.params.id)}/>
)

interface ICurveDetailProps {
  id: number;
  embedded?: boolean;
  embeddedRef?: HTMLElement
  onDelete?: ()=>void;
}

export const CurveDetail : React.FC<ICurveDetailProps> = ({id, embedded=false, embeddedRef, onDelete}) => {
  const pageRef = useRef();

  const [curve, setCurve] = useState<ICurve>()
  const [isModalOpen, setModalOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showRenameAlert, setShowRenameAlert] = useState(false);
  const { t } = useTranslation(['common', 'curves']);
  let history = useHistory();

  const [ Haptics ] = useHaptics();

  useEffect(()=>{
    get({url: `/curves/${id}`}).then(setCurve)
  }, [id])

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    get({url: `/curves/${id}`}).then(setCurve).then(()=>e.detail.complete())
  }

  const handlePointChange = (change: IChange) => {
    put({
      url: `/curves/${curve?.id}/${change.index}`,
      data: {x: change.x, y: change.y}
    }).then(setCurve)
  }

  const handlePointInsert = (itemIndex: number, position: 'before'|'after') => {
    post({
      url: `/curves/${curve?.id}/${itemIndex}`,
      data: {position: position}
    }).then(setCurve)
  }

  const handlePointDelete = (itemIndex: number) => {
    del({
      url: `/curves/${curve?.id}/${itemIndex}`
    }).then(setCurve)
  }

  const onChange: IOnChange = {
    change: handlePointChange, 
    insert: handlePointInsert, 
    delete: handlePointDelete
  }


  const handleModalOpen = () => {
    Haptics.impact({style: HapticsImpactStyle.Medium})
    setModalOpen(true)
  }

  const handleOffsetChange = debounce((change: number) => {
    put({
      url: `/curves/${curve?.id}`,
      data: {offset: change}
    }).then(setCurve)
  }, 500);

  if (!curve) {
    return null;
  } else {
    const name = curve.default?t(`curves:default_names.${curve.kind}`):curve.name
    const content = (
      <>
        <IonList inset>
          <IonItem button onClick={()=>setShowRenameAlert(true)}>
            <IonLabel>{t('curves:create.name')}</IonLabel>
            <IonNote slot='end'>{curve.name}</IonNote>
          </IonItem>
          <IonItem>
            <IonLabel>{t('curves:create.type')}</IonLabel>
            <CurveTypeBadge curve={curve}/>
          </IonItem>
        </IonList>
        <IonList inset>
          <IonButton size='small' expand='block' fill='clear' onClick={handleModalOpen}>
            <IonIcon slot='icon-only' icon={chevronUp} color='medium'/>
          </IonButton>
          <div style={{margin: '20px', marginTop: 0}} >
            <Chart curve={curve} onChange={onChange}/>
          </div>
          <ChartModal isOpen={isModalOpen} onClose={()=>setModalOpen(false)} pageRef={embedded?embeddedRef:pageRef.current} title={name}>
            <Chart curve={curve} onChange={onChange} />
          </ChartModal>
        </IonList>
        <IonList inset className='lp-remove-margin-bottom'>
          <Range min={-250} max={250} step={5} snaps ticks={false} label={t('curves:offset')} reset onChange={handleOffsetChange} defaultValue={curve.offset}>
            <IonIcon size='small' slot='start' icon={sunny} onClick={()=>handleOffsetChange(curve.offset-5)}/>
            <IonIcon slot='end' icon={sunny} onClick={()=>handleOffsetChange(curve.offset+5)}/>
          </Range>
        </IonList>
        <ListFooter>
          <IonLabel>{t('curves:descriptions.offset')}</IonLabel>
        </ListFooter>
        {!curve.default?
        <IonButton onClick={()=>setShowDeleteAlert(true)} className='inset' expand='block' color='danger'>
          {t('common:actions.delete')}
        </IonButton>
        :undefined}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={t('curves:delete.title', {name: curve.name})}
          message={t('curves:delete.text', {name: curve.name})}
          buttons={[
            {
              text: t('common:actions.cancel'),
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => setShowDeleteAlert(false)
            },
            {
              text: t('common:actions.delete'),
              role: 'delete',
              handler: () => {
                del({url: `/curves/${curve.id}`}).then(()=>{
                  if (!embedded) {
                    history.push('/curves')
                  }
                  if (onDelete) {onDelete()}
                })
              }
            }
          ]}
        />
        <IonAlert
          isOpen={showRenameAlert}
          onDidDismiss={() => setShowRenameAlert(false)}
          header={t('curves:rename.title', {name: curve.name})}
          buttons={[
            {
              text: t('common:actions.cancel'),
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => setShowRenameAlert(false)
            },
            {
              text: t('common:actions.done'),
              handler: (data) => {
                put({
                  url: `/curves/${curve.id}`,
                  data: {name: data.name}
                }).then(setCurve)
              }
            }
          ]}
          inputs={[
            {
              name: 'name',
              type: 'text',
              id: 'name-id',
              value: curve.name,
              placeholder: ''
            }
          ]}
        />
      </>
    )
    if (embedded) {
      return content
    } else {
      return (
        <IonPage ref={pageRef}>
          <IonHeader translucent>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton routerLink='/curves' routerDirection='back'>
                  <IonIcon slot='start' icon={chevronBack} />
                  {t('curves:title')}
                </IonButton>
              </IonButtons>
              <IonTitle>{name}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent fullscreen>
            <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
              <IonRefresherContent/>
            </IonRefresher>
            <IonGrid fixed>
              <IonHeader collapse="condense">
                <IonToolbar>
                  <IonTitle size="large">{name}</IonTitle>
                </IonToolbar>
              </IonHeader>
              {content}
            </IonGrid>
          </IonContent>
        </IonPage>
      )
    }
  }
}

export default PageCurveDetail;


