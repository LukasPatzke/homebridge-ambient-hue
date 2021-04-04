import  React from 'react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import { IGroup } from '../types/hue';
import { ListHeader } from './ListHeader';
import { useTranslation } from 'react-i18next';
import { ItemIcon, SkeletonItems } from './LightList';

interface IGroupListProps {
  groups: IGroup[];
}
export const GroupList: React.FC<IGroupListProps> = ({groups}) => {
  const { t } = useTranslation('groups');

  const rooms = groups.filter(group=>group.type==='Room').map((group, index) => (
    <IonItem button routerLink={`/groups/${group.id}`} routerDirection='forward' key={index}>
      <IonLabel>{group.name}</IonLabel>
      <ItemIcon slot='start' item={group}/>
    </IonItem>
  ))
  const zones = groups.filter(group=>group.type==='Zone').map((group, index) => (
    <IonItem button routerLink={`/groups/${group.id}`} routerDirection='forward' key={index}>
      <IonLabel>{group.name}</IonLabel>
      <ItemIcon slot='start' item={group}/>
    </IonItem>
  ))
  const other = groups.filter(group=>(group.type!=='Zone')&&(group.type!=='Room')).map((group, index) => (
    <IonItem button routerLink={`/groups/${group.id}`} routerDirection='forward' key={index}>
      <IonLabel>{group.name}</IonLabel>
      <ItemIcon slot='start' item={group}/>
    </IonItem>
  ))
  return (
    <div>
      <ListHeader inset>
        <IonLabel>{t('zones')}</IonLabel>
      </ListHeader>
      <IonList inset>
        {zones.length>0?zones:<SkeletonItems count={2}/>}
      </IonList>
      <ListHeader inset>
        <IonLabel>{t('rooms')}</IonLabel>
      </ListHeader>
      <IonList inset>
        {rooms.length>0?rooms:<SkeletonItems/>}
      </IonList>
      <ListHeader inset>
        <IonLabel>{t('other')}</IonLabel>
      </ListHeader>
      <IonList inset>
        {other.length>0?other:<SkeletonItems/>}
      </IonList>
    </div>
  )
}
