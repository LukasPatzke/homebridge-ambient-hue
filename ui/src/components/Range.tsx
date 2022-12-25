import React, { useState } from 'react';
import { IonLabel, IonIcon, IonItem, IonNote, IonRange, IonButton } from '@ionic/react';
import { RangeChangeEventDetail } from '@ionic/core';
import { closeCircle } from 'ionicons/icons';

interface IRangeProps {
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  onChange: (value: number) => void;
  step?: number; 
  snaps?: boolean;
  ticks?: boolean;
  reset?: boolean;
  children?: React.ReactNode;
}

export const Range: React.FC<IRangeProps> = ({label, min, max, defaultValue, onChange, children, step, snaps, ticks, reset}) => {
  const [value, setValue] = useState(defaultValue);

  const renderPercentage = (value: number | undefined) => {
    if (value) {
      return `${Math.round(value/2.54)} %`;
    } else {
      return '0 %';
    }
  }

  const handleRangeChange = (e: CustomEvent<RangeChangeEventDetail>) => {
    const value = e.detail.value as number
    onChange(value);
    setValue(value);
  }

  return (
    <>
      <IonItem lines='none'>
        <IonLabel className='lp-range-label'>{label}</IonLabel>
        {reset?<IonButton slot='start' onClick={()=>{onChange(0);setValue(0)}}><IonIcon icon={closeCircle}/></IonButton>:undefined}
        <IonNote slot='end' color='dark'>{renderPercentage(value)}</IonNote>
      </IonItem>
      <IonItem>
        <IonRange 
          min={min} max={max} value={value} 
          ticks={ticks} snaps={snaps} step={step}
          onIonChange={handleRangeChange} 
          style={{paddingTop: 0}}>
          {children}
        </IonRange>
      </IonItem>
    </>
  )
}