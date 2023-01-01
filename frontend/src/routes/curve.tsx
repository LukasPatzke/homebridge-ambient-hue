import { Group, Paper, Slider, Stack, Tabs } from '@mantine/core';
import { Prism } from '@mantine/prism';
import React, { useEffect, useState } from 'react';
import { Params, useLoaderData } from 'react-router-dom';
import { Curve, curvekind } from '../api.types';
import { CurveChart } from '../components/CurveChart';
import { Header, HeaderItem } from '../components/Header';
import { CapabilityBadge } from './accessories/capabilities';
import useTabStyles from './accessories/tab.styles';
import { TabsPanel } from './accessories/TabsPanel';

export const mapCurveKind = (kind: curvekind): string => {
  if (kind === 'bri') {
    return 'Brightness';
  } else {
    return ' Color Temperature';
  }
};
export const CurvePage: React.FC = () => {
  const {classes} = useTabStyles();

  const curve = useLoaderData() as Curve;
  const [points, setPoints] = useState(curve.points);
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const [y, setY] = useState(0);

  useEffect(()=>{
    setPoints(points.map((point, index)=>{
      if (index===selectedIndex) {
        return {...point, y: y};
      } else {
        return point;
      }
    }));
  }, [y]);

  return (
    <>
      <Header title={curve.name}>
        <HeaderItem label='Type'>
          <Group><CapabilityBadge kind={curve.kind}/></Group>
        </HeaderItem>
      </Header>
      <Tabs
        variant='outline'
        defaultValue='settings'
        classNames={{tab: classes.tab, tabsList: classes.tabsList, panel: classes.panel}}
      >
        <div className={classes.tabsListWrapper}>
          <Tabs.List>
            <Tabs.Tab value='settings'>Settings</Tabs.Tab>
            <Tabs.Tab value='debug'>Debug</Tabs.Tab>
          </Tabs.List>
        </div>
        <Paper shadow='xs'>
          <TabsPanel value='settings'>
            <CurveChart
              points={points}
              kind={curve.kind}
              draggable
              enableContextMenu
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
            <Stack>
              <div>{selectedIndex}</div>
              <Slider
                value={points[selectedIndex||0].y}
                min={curve.kind==='bri'?0:153}
                max={curve.kind==='bri'?100:500}
                onChange={setY}
              />
            </Stack>
          </TabsPanel>
          <TabsPanel value='debug' title='Debug'>
            <Prism language='json'>{JSON.stringify(curve, null, 2)}</Prism>
          </TabsPanel>
        </Paper>
      </Tabs>
    </>
  );
};

export async function loader({params}: {params: Params<string>}) {
  return fetch(`/api/curves/${params.curveId}`).then(res=>{
    if (!res.ok) {
      throw res;
    }
    return res;
  });
}