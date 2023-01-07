import {
  Button,
  createStyles,
  Flex,
  Group,
  Paper,
  Stack,
  Tooltip,
} from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import {
  IconCircleChevronLeft,
  IconCircleChevronRight,
  IconTrash,
} from '@tabler/icons';
import { FC, useEffect, useState } from 'react';
import { curvekind, Point } from '../../api.types';
import { TimeSlider } from '../CurveSettings/ContextMenu/TimeSlider';
import { LabeledSlider } from '../LabeledSlider';

const useStyles = createStyles((theme) => ({
  insert: {
    [theme.fn.smallerThan('sm')]: {
      flexBasis: '100%',
      flexGrow: 1,
    },
  },
  button: {
    minWidth: 135,
    flexGrow: 0,
    [theme.fn.smallerThan('sm')]: {
      flexGrow: 1,
    },
  },
  background: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[8]
        : theme.colors.gray[0],
  },
}));

interface PointSettingsProps {
  kind: curvekind;
  /** The point that is edited */
  point?: Point;
  /** The point to the left*/
  leftPoint?: Point;
  /** The point to the right */
  rightPoint?: Point;
  onChange: (value: Partial<Point>) => void;
  onChangeEnd: (value: Partial<Point>) => void;
  onDelete: () => void;
  onInsert: (poistion: 'before' | 'after') => void;
}

export const PointSettings: FC<PointSettingsProps> = ({
  kind,
  point,
  leftPoint,
  rightPoint,
  onChange,
  onChangeEnd,
  onDelete,
  onInsert,
}) => {
  const { classes } = useStyles();
  const [y, setY] = useState(0);

  useEffect(() => {
    onChange({ y: y });
  }, [y]);
  return (
    <Tooltip.Floating
      disabled={point !== undefined}
      label="Select a point on the curve to edit."
    >
      <Paper p="sm" sx={{ position: 'relative' }}>
        <Stack>
          <TimeSlider
            value={point?.x || 0}
            min={leftPoint?.x}
            max={rightPoint?.x}
            onChange={(value) => onChange({ x: value })}
            onChangeEnd={(value) => onChangeEnd({ x: value })}
            disabled={point === undefined || point.first || point.last}
          />
          <LabeledSlider
            wrapperProps={{
              label:
                kind === 'bri' ? 'Brightness Value' : 'Color Temperature Value',
              description: 'Changes the value for the selected point.',
            }}
            value={point?.y || 0}
            min={kind === 'bri' ? 0 : 153}
            max={kind === 'bri' ? 100 : 500}
            label={(value) => (kind === 'bri' ? `${value}%` : value)}
            onChange={setY}
            onChangeEnd={(value) => onChangeEnd({ y: value })}
            disabled={point === undefined}
          />

          <Flex justify="space-between" wrap="wrap" gap="sm">
            <Group grow position="right" className={classes.insert}>
              <Tooltip
                withArrow
                multiline
                withinPortal
                label="Insert a new point to the left of the selected point."
              >
                <Button
                  leftIcon={<IconCircleChevronLeft size={20} />}
                  disabled={point === undefined || point.first}
                  variant="light"
                  className={classes.button}
                  onClick={() => onInsert('before')}
                >
                  Insert left
                </Button>
              </Tooltip>
              <Tooltip
                withArrow
                multiline
                withinPortal
                label="Insert a new point to the right of the selected point."
              >
                <Button
                  rightIcon={<IconCircleChevronRight size={20} />}
                  disabled={point === undefined || point.last}
                  variant="light"
                  className={classes.button}
                  onClick={() => onInsert('after')}
                >
                  Insert right
                </Button>
              </Tooltip>
            </Group>

            <Button
              leftIcon={<IconTrash size={20} />}
              color="red"
              disabled={point === undefined || point.first || point.last}
              variant="outline"
              onClick={() => {
                openConfirmModal({
                  title: 'Confirm deletion',
                  centered: true,
                  labels: {
                    confirm: 'Delete point',
                    //eslint-disable-next-line quotes
                    cancel: "No don't delete it",
                  },
                  confirmProps: { color: 'red' },
                  onCancel: () => console.log('Cancel'),
                  onConfirm: onDelete,
                });
              }}
              className={classes.button}
            >
              Delete Point
            </Button>
          </Flex>
        </Stack>
      </Paper>
    </Tooltip.Floating>
  );
};
