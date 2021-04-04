import React from 'react';
import { useTranslation } from 'react-i18next';
import { IonList } from '@ionic/react';
import { IGroup } from '../types/hue';
import { InfoItem } from './LightInfos';

interface IGroupInfosProps {
  group: IGroup;
}

export const GroupInfos: React.FC<IGroupInfosProps> = ({group}) => {
  const { t } = useTranslation('lights');

  return (
    <IonList inset>
      <InfoItem label={t('info.id')} value={`groups/${group.id}`}/>
      <InfoItem label={t('info.uniqueId')} value={group.uniqueId}/>
      <InfoItem label={t('info.type')} value={group.type}/>
    </IonList>
  )
}