import { Button, Select, TextInput } from '@mantine/core';
import { closeAllModals, openModal } from '@mantine/modals';
import { IconChevronDown } from '@tabler/icons';
import React, { createRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { preload } from 'swr';

import { Curve, curvekind } from '../../api.types';
import { useCurves } from '../../data/curves';
import { fetcher } from '../../data/fetcher';

interface CurvePickerProps {
  kind: curvekind;
  value: Curve;
  onChange?: (value: Curve) => void;
  disabled?: boolean;
}

export const CurvePicker: React.FC<CurvePickerProps> = ({
  kind,
  value,
  onChange,
  disabled,
}) => {
  const { curves, mutate } = useCurves(kind);
  const navigate = useNavigate();
  const inputRef = createRef<HTMLInputElement>();

  const create = async (name: string) => {
    const res = await fetch(
      `/api/curves/${kind === 'bri' ? 'brightness' : 'colorTemperature'}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          count: 4,
        }),
      },
    );
    if (!res.ok) {
      throw res;
    }
    const curve = (await res.json()) as Curve;
    mutate();
    if (onChange) {
      onChange(curve);
    }
    navigate(`/${curve.resource}`);
  };

  return (
    <Select
      label={kind === 'bri' ? 'Brightness Curve' : 'Color Temperature Curve'}
      description={
        kind === 'bri'
          ? 'The Curve that is used to calculate the brightness.'
          : 'The Curve that is used to calculate the color temperature.'
      }
      data={(curves || [value]).map((curve) => ({
        value: curve.id.toString(),
        label: curve.name,
        group: curve.id === 0 ? 'Default curve' : 'Custom curves',
      }))}
      value={value.id.toString()}
      onChange={(value) => {
        if (!curves) {
          return;
        }
        const curve = curves.find((c) => c.id.toString() === value);
        if (curve === undefined) {
          throw `Curve ${value} not found`;
        }
        if (onChange) {
          onChange(curve);
        }
      }}
      shouldCreate={() => true}
      creatable
      getCreateLabel={() => '+ Create New'}
      onCreate={() => {
        openModal({
          title: 'Enter a name for the curve:',
          children: (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                closeAllModals();
                if (inputRef.current?.value) {
                  create(inputRef.current.value);
                }
              }}
            >
              <TextInput ref={inputRef} label="Name" data-autofocus />
              <Button fullWidth role="submit" mt="md">
                Create
              </Button>
            </form>
          ),
        });
        return null;
      }}
      rightSection={
        <>
          <IconChevronDown size={14} style={{ marginInline: 6 }} />
          <Button
            variant="subtle"
            compact
            style={{ pointerEvents: 'all' }}
            component={Link}
            to={`/${value.resource}`}
            disabled={disabled}
            onMouseOver={() => preload(value.resource, fetcher)}
          >
            Edit Curve
          </Button>
        </>
      }
      styles={{ rightSection: { pointerEvents: 'none' } }}
      rightSectionWidth={120}
      disabled={disabled}
    />
  );
};
