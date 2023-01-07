import { Alert, Button, Group, List } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons';
import { FC } from 'react';
import { Light } from '../../api.types';
import { reset } from '../../data/light';

interface SmartOffAlertProps {
  light?: Light;
}

export const SmartOffAlert: FC<SmartOffAlertProps> = ({ light }) => {
  if (!light || !light.smartOff) {
    return null;
  }

  return (
    <Alert icon={<IconAlertCircle size={16} />} title="Smart Off" color="blue">
      The following properties of this light were changed by a third party:
      <List size="sm">
        {light.smartOffOn && (
          <List.Item>{`On/Off (${light.lastOn} to ${light.currentOn})`}</List.Item>
        )}
        {light.smartOffBrightness && (
          <List.Item>{`Brightness (${light.lastBrightness}% to ${light.currentBrightness}%)`}</List.Item>
        )}
        {light.smartOffColorTemperature && (
          <List.Item>{`Color Temperature (${light.lastColorTemperature} mirek to ${light.currentColorTemperature} mirek)`}</List.Item>
        )}
      </List>
      <Group position="right">
        <Button onClick={() => reset(light)} variant="subtle">
          Retake control
        </Button>
      </Group>
    </Alert>
  );
};
