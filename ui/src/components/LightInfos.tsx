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
      <LightInfo label={t('info.type')} value={light.type}/>
      <LightInfo label={t('info.manufacturer')} value={light.manufacturername}/>
      <LightInfo label={t('info.model')} value={light.modelid}/>
    </IonList>
  )
}

interface ILightInfoProps {
  label: string;
  value: string;
}
const LightInfo: React.FC<ILightInfoProps> = ({label, value}) => {
  return (
    <IonItem>
      <IonLabel>{label}</IonLabel>
      <IonNote slot='end'>{value}</IonNote>
    </IonItem>
  )
}