import React from 'react';
import { useTranslation } from 'react-i18next';
import { IonList, IonLabel, IonIcon, IonItem, IonToggle } from '@ionic/react';
import { Range } from './Range';
import { debounce } from 'lodash';
import { ILight, ILightUpdate } from '../types/hue';
import { sunny, add, remove, colorWand } from 'ionicons/icons';
import { isLightCtControlled, isLightBriControlled } from './LightList';


interface ILightSettingsProps {
  light: ILight;
  onChange: (change: ILightUpdate) => void;
}

export const LightSettings: React.FC<ILightSettingsProps> = ({light, onChange}) => {
  const { t } = useTranslation(['lights', 'common']);
  const onBrightnessMaxChange = debounce((value:number)=>(
    onChange({bri_max: value} as ILightUpdate)), 250);
  const onThresholdChange = debounce((value:number)=>(
    onChange({on_threshold: value} as ILightUpdate)), 250);
  
  return (
    <IonList inset>
      {light.smart_off_active?
        <IonItem color='primary'>
          <IonLabel>{t('common:settings.smart_off')}</IonLabel>
          <IonIcon icon={colorWand}/>
        </IonItem>
      :undefined}
      <IonItem>
        <IonLabel>{t('settings.on')}</IonLabel>
        <IonToggle 
          checked={light.on} 
          onIonChange={(e)=>{
            onChange({on: e.detail.checked} as ILightUpdate)
          }}
        />
      </IonItem>
      <IonItem>
        <IonLabel>{t('settings.status')}</IonLabel>
        <IonToggle 
          checked={light.on_controlled} 
          onIonChange={(e)=>{
            onChange({on_controlled: e.detail.checked} as ILightUpdate)
          }}
        />
      </IonItem>
      <Range 
        label={t('settings.threshold')} 
        min={0} max={254} 
        defaultValue={light.on_threshold} 
        onChange={onThresholdChange}>
          <IonIcon slot='start' icon={remove}/>
          <IonIcon slot='end' icon={add}/>
      </Range>
      {isLightBriControlled(light)?
      <>
      <IonItem>
        <IonLabel>{t('settings.brightness')}</IonLabel>
        <IonToggle 
          checked={light.bri_controlled} 
          onIonChange={(e)=>{
            onChange({bri_controlled: e.detail.checked} as ILightUpdate)
          }}
        />
      </IonItem>
      <Range 
        label={t('settings.maxBrightness')} 
        min={0} max={254} 
        defaultValue={light.bri_max} 
        onChange={onBrightnessMaxChange}
      >
          <IonIcon size='small' slot='start' icon={sunny}/>
          <IonIcon slot='end' icon={sunny}/>
      </Range>
      </>
      :undefined}
      {isLightCtControlled(light)?
      <IonItem>
        <IonLabel>{t('settings.colorTemp')}</IonLabel>
        <IonToggle 
          checked={light.ct_controlled} 
          onIonChange={(e)=>{
            onChange({ct_controlled: e.detail.checked} as ILightUpdate)
          }}
        />
      </IonItem>
      :undefined}
    </IonList>
  )
}
