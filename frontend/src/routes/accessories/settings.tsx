import { Stack, useMantineTheme } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import React, { useEffect, useState } from 'react';
import { Accessory, Light } from '../../api.types';
import { LabeledSlider } from '../../components/LabeledSlider';
import { LabeledSwitch } from '../../components/LabeledSwitch';


interface SettingsProps {
  accessory: Accessory;
}

function debounce<A = unknown, R = void>(
  fn: (args: A) => R,
  ms: number,
): [(args: A) => Promise<R>, () => void] {
  let timer: NodeJS.Timeout;

  const debouncedFunc = (args: A): Promise<R> =>
    new Promise((resolve) => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        resolve(fn(args));
      }, ms);
    });

  const teardown = () => clearTimeout(timer);

  return [debouncedFunc, teardown];
}

const useDebounce = <A = unknown, R = void>(
  fn: (args: A) => R,
  ms: number,
): ((args: A) => Promise<R>) => {
  const [debouncedFun, teardown] = debounce<A, R>(fn, ms);

  useEffect(() => () => teardown(), []);

  return debouncedFun;
};

export const Settings: React.FC<SettingsProps> = ({accessory}) => {
  const theme = useMantineTheme();

  const [onControlled, setOnControlled] = useState(false);
  const [onThreshold, setOnThreshold] = useState(0);
  const [brightnessControlled, setBrightnessControlled] = useState(false);
  const [brightnessFactor, setBrightnessFactor] = useState(0);
  const [colorTemperatureControlled, setColorTemperatureControlled] = useState(false);



  useEffect(()=>{
    if (accessory) {
      setOnControlled(accessory.onControlled);
      setOnThreshold(accessory.onThreshold);
      setBrightnessControlled(accessory.brightnessControlled);
      setBrightnessFactor(accessory.brightnessFactor);
      setColorTemperatureControlled(accessory.colorTempertureControlled);
    }
  }, [accessory]);

  const renderThumbIcon = (checked: boolean) => {
    if (checked) {
      return <IconCheck size={12} color={theme.colors.teal[theme.fn.primaryShade()]}/>;
    } else {
      return <IconX size={12} color={theme.colors.red[theme.fn.primaryShade()]}/>;
    }
  };

  const onChange = (change: Partial<Light>) => {
    fetch(`/api/accessories/${accessory.accessoryId}`, {
      method:'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(change),
    }).then((response) => {
      if (!response.ok) {
        throw response;
      }
      return response.json();
    });
  };

  const onChangeDebounced = useDebounce(onChange, 250);

  return (
    <form>
      <Stack>
        <LabeledSwitch
          wrapperProps={{
            label:'On/Off Controlled',
            description:'Whether ambientHUE controls the On/Off property of the light.',
          }}
          color='teal'
          thumbIcon={renderThumbIcon(onControlled)}
          checked={onControlled}
          onChange={event=>{
            setOnControlled(event.currentTarget.checked);
            onChange({onControlled: event.currentTarget.checked});
          }}
        />

        <LabeledSlider
          wrapperProps={{
            label:'On Threshold',
            description:'The minimum brightness that is needed to turn the light on.',
          }}
          label={value=> `${value}%`}
          value={onThreshold}
          onChange={value=>{
            setOnThreshold(value);
            onChangeDebounced({onThreshold: value});
          }}
        />

        {accessory.isBrightnessCapable &&
        <LabeledSwitch
          wrapperProps={{
            label:'Brightness Controlled',
            description:'Whether ambientHUE controls the brightness property of the light.',
          }}
          color='teal'
          thumbIcon={renderThumbIcon(brightnessControlled)}
          checked={brightnessControlled}
          onChange={event=>{
            setBrightnessControlled(event.currentTarget.checked);
            onChange({brightnessControlled: event.currentTarget.checked});
          }}
        />
        }

        {accessory.isBrightnessCapable &&
        <LabeledSlider
          wrapperProps={{
            label:'Brightness Factor',
            description:'A factor that is multiplicated with the calculated brightness value.',
          }}
          label={value=> `${value}%`}
          value={brightnessFactor}
          onChange={value=>{
            setBrightnessFactor(value);
            onChangeDebounced({brightnessFactor: value});
          }}
        />
        }

        {accessory.isColorTemperatureCapable &&
        <LabeledSwitch
          wrapperProps={{
            label:'Color Temperature Controlled',
            description:'Whether ambientHUE controls the color temperature property of the light.',
          }}
          color='teal'
          thumbIcon={renderThumbIcon(colorTemperatureControlled)}
          checked={colorTemperatureControlled}
          onChange={event=>{
            setColorTemperatureControlled(event.currentTarget.checked);
            onChange({colorTempertureControlled: event.currentTarget.checked});
          }}
        />
        }
      </Stack>
    </form>
  );
};