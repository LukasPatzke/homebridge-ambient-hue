import React from 'react';
import { useTranslation } from 'react-i18next';
import { IonActionSheet, ActionSheetButton } from '@ionic/react';


interface IActionSheetProps {
  isOpen: boolean;
  itemIndex: number;
  dataLenght: number;
  onDelete: (itemIndex: number) => void;
  onEdit: () => void;
  onInsert: (itemIndex: number, position: 'before' | 'after') => void;
  onCancel: () => void;
}

export const ActionSheet: React.FC<IActionSheetProps> = ({isOpen, itemIndex, dataLenght, onDelete, onInsert, onCancel, onEdit}) => {
  const { t } = useTranslation('common');

  var buttons: ActionSheetButton[] = [
    {
      text: t('actions.delete'),
      role: 'destructive',
      handler: () => onDelete(itemIndex)
    },
    {
      text: t('actions.edit'),
      handler: () => onEdit()
    }
  ]
  if (itemIndex !== 0) {
    buttons.push({
      text: t('actions.addBefore'),
      handler: () => onInsert(itemIndex, 'before')
    })
  }
  if (itemIndex !== dataLenght-1) {
    buttons.push({
      text: t('actions.addAfter'),
      handler: () => onInsert(itemIndex, 'after')
    })
  }
  buttons.push({
    text: t('actions.cancel'),
    role: 'cancel',
    handler: () => onCancel()
  })

  return (
    <IonActionSheet
      isOpen={isOpen}
      onDidDismiss={onCancel}
      buttons={buttons}
    />
  )
}