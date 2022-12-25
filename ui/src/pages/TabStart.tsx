import React, { useRef, useState, useEffect, RefObject } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonGrid, IonCard, IonCardContent, IonIcon, IonLabel, IonRow, IonCol, IonButtons, IonButton, IonModal, IonReorderGroup, IonItem, IonReorder, IonList, IonRefresher, IonRefresherContent, IonItemSliding, IonItemOptions, IonItemOption, useIonViewWillEnter } from '@ionic/react';
import { ItemReorderEventDetail, RefresherEventDetail } from '@ionic/core';
import { IPosition, ILightInfo, IGroupInfo } from 'src/types/hue';
import { get, patch } from '../components/useApi';
import { grid, addCircle, removeCircle, colorWand } from 'ionicons/icons';
import { useTranslation } from 'react-i18next';
import { ListHeader } from 'src/components/ListHeader';
import { ItemIcon } from 'src/components/LightList';
import { lightInfoReducer } from 'src/utils';


const positionVisible = (position: IPosition) => (
  position.light?.published || position.group?.published || false
)

const positionUniqueId = (position: IPosition) => (
  position.light?.uniqueId || position.group?.uniqueId || ''
)


const TabStart: React.FC = () => {
  const pageRef = useRef();
  const [positions, setPositions] = useState<IPosition[]>([])
  const [reorder, setReorder] = useState<boolean>(false)

  const { t } = useTranslation('common')

  useEffect(() => {
    const onVisibilityChange = () => {
      if (!document.hidden) {
        get({url: '/positions'}).then(setPositions)
      }
    }
    window.addEventListener('visibilitychange', onVisibilityChange, false)
    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])
  
  useIonViewWillEnter(()=>{
    update()
  })

  const update = ()=>(
    get({url: '/positions'}).then(setPositions)
  )

  const handleLightClick = (light: ILightInfo) => {
    patch({
      url: `/lights/${light.id}`,
      data: {on: !light.on}
    }).then(update)
  }
  const handleGroupClick = (group: IGroupInfo) => {
    patch({
      url: `/groups/${group.id}`,
      data: {on: !group.lights[0].on}
    }).then(update)
  }

  const doRefresh = (e: CustomEvent<RefresherEventDetail>) => {
    update().then(()=>e.detail.complete())
  }

  const handleVisible = (position: IPosition, visible:boolean) => (
    patch({
      url: `/devices/${positionUniqueId(position)}`,
      data: {published: visible}
    }).then(update)
  )

  const handleReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
    patch({
      url: '/positions',
      data: event.detail
    }).then(data=>{
      event.detail.complete(positions)
      setPositions(data)
    })
  }
  
  const tiles = positions.filter(positionVisible).map((pos, index)=>{
      if (pos.light) {
        return (
          <Tile
            key={index}
            item={pos.light}
            label={pos.light.name}
            state={pos.light.on}
            onClick={()=>pos.light?handleLightClick(pos.light):undefined}
            smartOff={pos.light.smartoffActive}
          />
        )
      } else if (pos.group) {
        return (
          <Tile
            key={index}
            item={pos.group}
            icon={grid}
            label={pos.group.name}
            state={pos.group.lights.reduce(lightInfoReducer).on}
            onClick={()=>pos.group?handleGroupClick(pos.group):undefined}
            smartOff={pos.group.lights.reduce(lightInfoReducer).smartoffActive}
          />
        )
      } else { 
        return undefined
      }
    })
  return (
    <IonPage ref={pageRef}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="end">
            <IonButton onClick={()=>setReorder(true)} >
              {t('actions.edit')}
            </IonButton>
          </IonButtons>
          <IonTitle>ambientHUE</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent/>
        </IonRefresher>
        <IonGrid fixed>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">ambientHUE</IonTitle>
          </IonToolbar>
        </IonHeader>
        <ListHeader><IonLabel>{t('settings.favorites')}</IonLabel></ListHeader>
        <IonRow class="ion-justify-content-start">
          {tiles}
          {tiles.length===0?
          <IonCol sizeXl='auto' sizeLg='auto' sizeMd='auto' sizeSm='auto' sizeXs='4'>
            <IonCard button onClick={()=>setReorder(true)} className='lp-tile primary translucent'>
              <IonCardContent  className='lp-tile-content'>
                <div className='lp-tile-icon'><IonIcon icon={addCircle} color='primary'/></div>
                <div className='lp-tile-text'>
                  <div className='lp-tile-label'><IonLabel color='dark'>{t('actions.add')}</IonLabel></div>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
          :undefined}
        </IonRow>
        </IonGrid>
      </IonContent>
      <ReorderModal 
        isOpen={reorder} 
        pageRef={pageRef.current} 
        positions={positions}
        onClose={()=>setReorder(false)}
        onVisible={handleVisible}
        onReorder={handleReorder}
      />
    </IonPage>
  );
};

interface ITile {
  item?: ILightInfo | IGroupInfo
  icon?: string
  label: string
  state: boolean
  onClick?: (event: React.MouseEvent<HTMLIonCardElement, MouseEvent>) => void
  routerLink?: string
  size?: 'small'|'large'
  style?: React.CSSProperties
  disabled?: boolean
  smartOff?: Boolean
}

export const Tile: React.FC<ITile> = ({icon, item, label, state, onClick, routerLink, size='small', style, disabled, smartOff}) => {
  const colSize = size==='large'?'12':'auto';
  const { t } = useTranslation('common')
  return (
    <IonCol sizeXl={colSize} sizeLg={colSize} sizeMd={colSize} sizeSm={colSize} sizeXs={size==='small'?'4':'12'}>
      <IonCard 
        onClick={onClick} 
        routerLink={routerLink} 
        disabled={disabled}
        style={style}  
        routerDirection='forward' 
        button
        className={size==='small'?'lp-tile':'lp-tile large'}
      >
        <IonCardContent className={disabled?'lp-tile-content disabled':'lp-tile-content'}>
          <div className='lp-tile-icon'>
            {item?
            <ItemIcon item={item} disabled={!state}/>:
            <IonIcon icon={icon} color={state?'primary':undefined}/>}
          </div>
          {smartOff && state?
            <IonIcon className='lp-tile-smart-off-icon' icon={colorWand} color='primary'/>:undefined
          }
          <div className='lp-tile-text'>
            <div className='lp-tile-label'><IonLabel color={state?'dark':undefined}>{label}</IonLabel></div>
            <div className='lp-tile-state'>
              <IonLabel>
                {state?
                  smartOff?t('settings.smart_off')
                  :t('settings.on')
                  :t('settings.off')
                }
              </IonLabel>
            </div>
          </div>
        </IonCardContent>
      </IonCard>
    </IonCol>
  )
}

interface IReorderModal {
  isOpen: boolean
  onClose: ()=>void;
  pageRef?: HTMLElement;
  positions: IPosition[];
  onVisible: (position: IPosition, visible:boolean)=>Promise<void>;
  onReorder: (event: CustomEvent<ItemReorderEventDetail>)=>void
}

const ReorderModal: React.FC<IReorderModal> = ({isOpen, onClose, pageRef, positions, onVisible, onReorder}) => {
  const { t } = useTranslation('common')
  let refs: RefObject<HTMLIonItemSlidingElement>[] = []
  positions.forEach(pos=>{refs.push(React.createRef<HTMLIonItemSlidingElement>())})
  
  // const itemRef = useRef(refs);

  const items = positions.map((pos, index)=>(
    <IonItemSliding key={index} ref={refs[index]}>
      <IonItemOptions 
        side='end'
        onIonSwipe={()=>{
          onVisible(pos, false)
          refs[index].current?.close()
        }}
      >
        <IonItemOption 
          onClick={()=>{
            onVisible(pos, false)
            refs[index].current?.close()
          }}
          expandable
          disabled={!positionVisible(pos)}
          color='danger'
        >
          {t('common:actions.hide')}
        </IonItemOption>
      </IonItemOptions>
      <IonItemOptions 
        side='start' 
        onIonSwipe={()=>{
          onVisible(pos, true)
          refs[index].current?.close()
        }}
      >
        <IonItemOption 
          onClick={()=>{
            onVisible(pos, true)
            refs[index].current?.close()
          }}
          expandable={!positionVisible(pos)}
          disabled={positionVisible(pos)}
          color='primary'
        >
          {t('common:actions.add')}
        </IonItemOption>
      </IonItemOptions>
      <IonItem key={index}>
        <IonButton 
          slot='start' fill='clear' 
          onClick={()=>{
            if ((positionVisible(pos)) && (refs[index].current)) {
              refs[index].current?.open('end')
            } else {
              onVisible(pos, !positionVisible(pos))
            }
          }}
        >
          <IonIcon 
            slot='icon-only' 
            icon={positionVisible(pos)?removeCircle:addCircle}
            color={positionVisible(pos)?'danger':'success'}
          />
        </IonButton>
        <IonLabel>{pos.light?.name||pos.group?.name}</IonLabel>
        <IonReorder slot='end'/>
      </IonItem>
    </IonItemSliding>
    
  ))

  return (
    <IonModal presentingElement={pageRef} canDismiss onDidDismiss={onClose} isOpen={isOpen}>
      <IonHeader>
          <IonToolbar>
            <IonTitle>{t('actions.reorder')}</IonTitle>
            <IonButtons slot='end'>
              <IonButton onClick={onClose}>{t('actions.done')}</IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonList inset>
          <IonReorderGroup onIonItemReorder={onReorder} inlist disabled={false}>
            {items}
          </IonReorderGroup>
          </IonList>
        </IonContent>
    </IonModal>
  )
}

export default TabStart;
