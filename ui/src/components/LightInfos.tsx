import React from 'react';
import { useTranslation } from 'react-i18next';
import { IonList, IonLabel, IonItem, IonNote } from '@ionic/react';
import { ILight } from '../types/hue';

interface ILightInfosProps {
  light: ILight;
}

export const LightInfos: React.FC<ILightInfosProps> = ({light}) => {
  const { t } = useTranslation('lights');

  return (
    <IonList inset>
      <InfoItem label={t('info.id')} value={light.id}/>
      <InfoItem label={t('info.uniqueId')} value={light.accessoryId}/>
      <InfoItem label={t('info.type')} value={light.type}/>
    </IonList>
  )
}

interface IInfoItemProps {
  label: string;
  value: string;
}

export const InfoItem: React.FC<IInfoItemProps> = ({label, value}) => {
  return (
    <IonItem>
      <IonLabel>{label}</IonLabel>
      <IonNote slot='end' style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        wordWrap: 'normal',
        maxWidth: '60%'
      }}>
        {value}
      </IonNote>
    </IonItem>
  )
}