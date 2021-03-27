import  React from 'react';
import { IonList, IonItem, IonLabel, IonIcon, IonSkeletonText } from '@ionic/react';
import { bulb } from 'ionicons/icons';
import { ILight, ILightInfo, IGroupInfo, IGroup } from '../types/hue';
import Room from '../icons/room.svg';
import Zone from '../icons/zone.svg';


export const isLightHueControlled = (light: ILightInfo|ILight) => {
  if (light.type==='Color light') {
    return true
  } else if (light.type==='Extended color light') {
    return true
  } else {
    return false
  }
}

export const isLightCtControlled = (light: ILightInfo|ILight) => {
  if (light.type==='Color temperature light') {
    return true
  } else if (light.type==='Extended color light') {
    return true
  } else {
    return false
  }
}

export const isLightBriControlled = (light: ILightInfo|ILight) => {
  if (light.type==='On/off light') {
    return false
  } else if (light.type==='On/Off plug-in unit') {
    return false
  } else {
    return true
  }
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

  if (item.type === 'Room') {
    icon = Room;
    color = 'secondary'
  } else 
  if (item.type === 'Zone') {
    icon = Zone;
    color = 'primary'
  } else if ((item.type === 'Color light') || (item.type === 'Extended color light')){
    icon = bulb;
    color = 'primary'
  } else if (item.type === 'Color temperature light') {
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