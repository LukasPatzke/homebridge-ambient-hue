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
    onChange({briMax: value} as ILightUpdate)), 250);
  const onThresholdChange = debounce((value:number)=>(
    onChange({onThreshold: value} as ILightUpdate)), 250);
  return (
    <IonList inset>
      {light.smartOffActive?
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
          checked={light.onControlled} 
          onIonChange={(e)=>{
            onChange({onControlled: e.detail.checked} as ILightUpdate)
          }}
        />
      </IonItem>
      <Range 
        label={t('settings.threshold')} 
        min={0} max={254} 
        defaultValue={light.onThreshold} 
        onChange={onThresholdChange}>
          <IonIcon slot='start' icon={remove}/>
          <IonIcon slot='end' icon={add}/>
      </Range>
      {isLightBriControlled(light)?
      <>
      <IonItem>
        <IonLabel>{t('settings.brightness')}</IonLabel>
        <IonToggle 
          checked={light.briControlled} 
          onIonChange={(e)=>{
            onChange({briControlled: e.detail.checked} as ILightUpdate)
          }}
        />
      </IonItem>
      <Range 
        label={t('settings.maxBrightness')} 
        min={0} max={254} 
        defaultValue={light.briMax} 
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
          checked={light.ctControlled} 
          onIonChange={(e)=>{
            onChange({ctControlled: e.detail.checked} as ILightUpdate)
          }}
        />
      </IonItem>
      :undefined}
    </IonList>
  )
}
