import {
  Button,
  createStyles,
  Group,
  Input,
  Loader,
  Paper,
  Stack,
  Tabs,
} from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { Prism } from '@mantine/prism';
import { IconTrash } from '@tabler/icons';
import React, { useEffect, useState } from 'react';
import { useComplexState } from 'react-complex-state';
import { useParams } from 'react-router-dom';
import { curvekind, Point } from '../../api.types';
import { CapabilityBadge } from '../../components/capabilities';
import { CurveChart } from '../../components/CurveSettings/CurveChart';
import { Header, HeaderItem } from '../../components/Header';
import { PointSettings } from '../../components/PointSettings';
import useTabStyles from '../../components/tab.styles';
import { TabsPanel } from '../../components/TabsPanel';
import { useCurve } from '../../data/curve';
import { ErrorPage } from '../../data/errorPage';
import { deletePoint, update as updatePoint } from '../../data/point';

export const mapCurveKind = (kind: curvekind): string => {
  if (kind === 'bri') {
    return 'Brightness';
  } else {
    return ' Color Temperature';
  }
};

const useStyles = createStyles((theme) => ({
  background: {
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[8]
        : theme.colors.gray[0],
  },
  deleteButton: {
    [theme.fn.smallerThan('sm')]: {
      paddingInline: 7,
    },
  },
  deleteLabel: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },
  deleteIcon: {
    [theme.fn.smallerThan('sm')]: {
      marginRight: 0,
    },
  },
}));

interface CurvePageProps {
  kind: curvekind;
}
export const CurvePage: React.FC<CurvePageProps> = ({ kind }) => {
  const { classes: TabClasses } = useTabStyles();
  const { classes } = useStyles();
  const { curveId } = useParams();
  const {
    curve,
    error,
    isLoading,
    deleteCurve,
    updateName,
    insertPoint,
  } = useCurve(kind, curveId);

  const points = useComplexState(curve?.points || []);
  const [y, setY] = useState(0);
  const [x, setX] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number>();

  useEffect(() => {
    if (curve && !isLoading) {
      points.setValue(curve.points);

      if (selectedIndex && selectedIndex > curve.points.length - 1) {
        setSelectedIndex(undefined);
      }
    }
  }, [curve, isLoading]);

  useEffect(() => {
    if (selectedIndex === undefined) {
      return;
    }
    if (y === points.value[selectedIndex].y) {
      return;
    }
    points.partialUpdate({ y: y }, selectedIndex);
  }, [y]);
  useEffect(() => {
    if (selectedIndex === undefined) {
      return;
    }
    if (x === points.value[selectedIndex].x) {
      return;
    }
    points.partialUpdate({ x: x }, selectedIndex);
  }, [x]);

  const update = async (point: Partial<Point>) => {
    if (selectedIndex === undefined) {
      return;
    }

    const updatedPoint = await updatePoint(
      point,
      points.value[selectedIndex].resource,
    );

    points.update(updatedPoint, selectedIndex);
  };

  if (error) {
    return <ErrorPage error={error} />;
  }
  if (!curve) {
    return <Loader />;
  }

  return (
    <>
      <Header
        title={curve.name}
        editable
        onChange={updateName}
        rightElement={
          <Button
            color="red"
            variant="outline"
            leftIcon={<IconTrash size={20} />}
            disabled={curve.id === 0}
            classNames={{
              root: classes.deleteButton,
              label: classes.deleteLabel,
              icon: classes.deleteIcon,
            }}
            onClick={() => {
              openConfirmModal({
                title: 'Confirm deletion',
                centered: true,
                labels: {
                  confirm: 'Delete curve',
                  // eslint-disable-next-line quotes
                  cancel: "No don't delete it",
                },
                confirmProps: { color: 'red' },
                onCancel: () => console.log('Cancel'),
                onConfirm: deleteCurve,
              });
            }}
          >
            Delete
          </Button>
        }
      >
        <HeaderItem label="Type">
          <Group>
            <CapabilityBadge kind={curve.kind} />
          </Group>
        </HeaderItem>
      </Header>
      <Tabs
        variant="outline"
        defaultValue="settings"
        classNames={{
          tab: TabClasses.tab,
          tabsList: TabClasses.tabsList,
          panel: TabClasses.panel,
        }}
      >
        <div className={TabClasses.tabsListWrapper}>
          <Tabs.List>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
            <Tabs.Tab value="debug">Debug</Tabs.Tab>
          </Tabs.List>
        </div>
        <Paper shadow="xs">
          <TabsPanel value="settings">
            <Stack>
              <Input.Wrapper
                label="Curve Definiton"
                description="Select a point on the curve to edit"
              >
                <Paper
                  mt="sm"
                  p="sm"
                  radius="md"
                  className={classes.background}
                >
                  <CurveChart
                    points={points.value}
                    kind={curve.kind}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                    onChange={(value) => {
                      setX(value.x);
                      setY(value.y);
                      // points.partialUpdate(value, index);
                    }}
                    onChangeEnd={update}
                  />
                </Paper>
              </Input.Wrapper>
              <PointSettings
                kind={kind}
                point={
                  selectedIndex === undefined
                    ? undefined
                    : points.value[selectedIndex]
                }
                leftPoint={
                  selectedIndex === undefined
                    ? undefined
                    : points.value[selectedIndex - 1]
                }
                rightPoint={
                  selectedIndex === undefined
                    ? undefined
                    : points.value[selectedIndex + 1]
                }
                onChange={(value) => {
                  if (selectedIndex === undefined) {
                    return;
                  }
                  points.partialUpdate(value, selectedIndex);
                }}
                onChangeEnd={update}
                onDelete={async () => {
                  await deletePoint;
                  setSelectedIndex(undefined);
                }}
                onInsert={async (position) => {
                  if (selectedIndex === undefined) {
                    return;
                  }
                  await insertPoint(position, selectedIndex);
                  setSelectedIndex(
                    position === 'after' ? selectedIndex + 1 : selectedIndex,
                  );
                }}
              />
            </Stack>
          </TabsPanel>
          <TabsPanel value="debug" title="Debug">
            <Prism language="json">{JSON.stringify(curve, null, 2)}</Prism>
          </TabsPanel>
        </Paper>
      </Tabs>
    </>
  );
};
