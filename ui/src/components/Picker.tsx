import React from "react";
import { useTranslation } from 'react-i18next';
import { PickerColumn } from "@ionic/core";
import { IonPicker } from "@ionic/react";
import { range } from '../utils';
import { formatMinutes } from './Chart'

export enum PickerMeasure {
  'colorTemp',
  'brightness',
}

export interface IPickerChange {
  time: {
    columnIndex: number;
    text: string;
    value: number;
  }
  value: {
    columnIndex: number;
    text: string;
    value: number;
  }

}

interface IPickerProps {
  isOpen : boolean;
  defaultValue?: {
    time: number,
    value: number
  }
  scale: {min: number, max: number}
  displayPercent?: boolean
  onSave : (change: IPickerChange) => void;
  onCancel : ()=>void;
}

const isDefaultValueOnEnd = (defaultValue: {time: number, value: number} | undefined) => {
  if (defaultValue) {
    if ((defaultValue.time === 0) || (defaultValue.time === 1440)) {
      return true;
    }
  }
  return false;
}

export const Picker: React.FC<IPickerProps> = ({onSave, onCancel, isOpen, scale, displayPercent=false, defaultValue}) => { 
  const { t } = useTranslation('common');

  const defaultIndex = () => {
    if (defaultValue) {
      const index = defaultValue.value - scale.min;
      if (displayPercent) {
        return Math.round(index/(scale.max-scale.min)*100)
      } else {
        return index
      }
    } else {
      return undefined
    }
  }

  const TimeColumn: PickerColumn = {
      name: "time",
      options: range(0, 1441, 30).map(value=>({
        text: formatMinutes(value),
        value: value
      })),
      selectedIndex: defaultValue?Math.round(defaultValue.time / 30):undefined
    }
  const ValueColumn: PickerColumn  = {
      name: "value",
      options: range(scale.min, scale.max+1).map(value=>({
        text: displayPercent?`${value} %`:`${value}`,
        value: value
      })),
      selectedIndex: defaultIndex()
    }

  var columns: PickerColumn[];

  if (isDefaultValueOnEnd(defaultValue)) {
    columns = [ValueColumn];
  } else {
    columns=[TimeColumn, ValueColumn];
  }

  return (
  <IonPicker
    isOpen={isOpen}
    columns={columns}
    onDidDismiss={onCancel}
    buttons={[
    {
      text: t('actions.cancel'),
      role: "cancel",
      handler: value => {
        onCancel()
      }
    },
    {
      text: t('actions.done'),
      handler: value => {
        if (isDefaultValueOnEnd(defaultValue)) {
          value.time = {
            columnIndex: 0,
            text: '',
            value: defaultValue?.time,
          }
        }
        if (displayPercent) {
          value.value.value = Math.round(value.value.value*(scale.max-scale.min)/100)
        } 
        onSave(value)
      }
    }
    ]}
  
  ></IonPicker>
  )
}