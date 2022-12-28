import  React from 'react';
import { IonList, IonItem, IonLabel, IonIcon, IonSkeletonText, IonMenuToggle } from '@ionic/react';
import { bulb } from 'ionicons/icons';
import { ILight, ILightInfo, IGroupInfo, IGroup } from '../types/hue';
import Room from '../icons/room.svg';
import Zone from '../icons/zone.svg';


export const isLightHueControlled = (light: ILightInfo|ILight) => {
  return false
}

export const isLightCtControlled = (light: ILightInfo|ILight) => {
  return light.currentColorTemperature !== null
}

export const isLightBriControlled = (light: ILightInfo|ILight) => {
  return light.currentBrightness !== null
}

interface ILightListProps {
  lights: ILightInfo[];
}

export const LightList: React.FC<ILightListProps> = ({lights}) => {
  const items = lights.map((light, index) => (
    <IonItem routerLink={`/lights/${light.id}`} routerDirection='forward' key={index}>
      <ItemIcon slot='start' item={light}/>
      <IonLabel>{light.name}</IonLabel>
    </IonItem>
  ))
  return (
    <IonList inset>
      {items.length>0?items:<SkeletonItems/>}
    </IonList>
  )
}



interface IItemIcon {
  item: ILight | ILightInfo | IGroup | IGroupInfo
  slot?: string
  disabled?: boolean
}

export const ItemIcon: React.FC<IItemIcon> = ({item, disabled, ...props}) => {
  let icon: string
  let color: string

  if (item.type === 'room') {
    icon = Room;
    color = 'secondary'
  } else if (item.type === 'zone') {
    icon = Zone;
    color = 'primary'
  } else if (item.type === 'classic_bulb'){
    icon = bulb;
    color = 'primary'
  } else if (item.type === 'luster_bulb') {
    icon = bulb;
    color = 'secondary'
  } else {
    icon = bulb;
    color = 'dark'
  }

  return (
    <IonIcon 
      icon={icon}
      color={!disabled?color:undefined}
      {...props}
    />
  )
}


interface ISkeletonItemsProps {
  count?: number
}

export const SkeletonItems: React.FC<ISkeletonItemsProps> = ({count=10}) => {
  var i;
  var items: any[] = []
  for (i = 0; i < count; i++) {
    items.push(
      <IonItem key={i}>
        <IonSkeletonText slot='start' animated style={{width: '20px', height: '20px'}}/>
        <IonLabel>
          <IonSkeletonText 
            animated 
            style={{
              width: `${30 + (Math.random() * 70)}%`
            }}
          />
        </IonLabel>
      </IonItem>
    )
  }
  return <>{items}</>
}