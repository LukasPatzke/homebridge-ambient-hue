import React from 'react';
import { Accessory } from '../../api.types';
import { TextOutput } from '../../components/TextOutput';

interface InfoProps {
  accessory: Accessory;
}
export const Info: React.FC<InfoProps> = ({accessory}) => (
  <>
    <TextOutput label='Hue Id' description='The unique identifier in the hue bridge.'>
      {accessory.hueId}
    </TextOutput>
    <TextOutput label='Legacy Id' description='The legacy identifier in the hue v1 api.'>
      {accessory.legacyId || 'undefined'}
    </TextOutput>
    <TextOutput label='Homekit Accessory Id' description='The unique indentifier of the HomeKit accessory'>
      {accessory.accessoryId}
    </TextOutput></>
);