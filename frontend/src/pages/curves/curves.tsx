import {
  Avatar,
  createStyles,
  Flex,
  Loader,
  MediaQuery,
  Stack,
} from '@mantine/core';
import { FC } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { HideOnBreakpoint } from '../../components/HideOnBreakpoint';
import { NavLink } from '../../components/NavLink';
import { useCurves } from '../../data/curves';
import { ErrorPage } from '../../data/errorPage';

const useStyles = createStyles((theme) => ({
  content: {
    flexGrow: 1,
  },
}));

export const CurvesPage: FC = () => {
  const { classes } = useStyles();
  const brightness = useCurves('bri');
  const colorTemperature = useCurves('ct');
  const { curveId } = useParams();
  const navigate = useNavigate();

  if (brightness.isLoading || colorTemperature.isLoading) {
    return <Loader />;
  }
  if (brightness.error || colorTemperature.error) {
    return (
      <ErrorPage error={(brightness.error || colorTemperature.error) as any} />
    );
  }

  return (
    <Flex>
      <HideOnBreakpoint smallerThan="sm" disabled={curveId === undefined}>
        <MediaQuery smallerThan="sm" styles={{ flexGrow: 1 }}>
          <div>
            <Stack>
              {brightness.curves?.map((curve) => (
                <NavLink
                  key={curve.id}
                  to={`brightness/${curve.id}`}
                  label={curve.name}
                  icon={<Avatar alt={curve.kind}>{curve.kind}</Avatar>}
                />
              ))}
            </Stack>
            <Stack>
              {colorTemperature.curves?.map((curve) => (
                <NavLink
                  key={curve.id}
                  to={`colorTemperature/${curve.id}`}
                  label={curve.name}
                  icon={<Avatar alt={curve.kind}>{curve.kind}</Avatar>}
                />
              ))}
            </Stack>
          </div>
        </MediaQuery>
      </HideOnBreakpoint>
      <HideOnBreakpoint smallerThan="sm" disabled={curveId !== undefined}>
        <div className={classes.content}>
          <Outlet />
        </div>
      </HideOnBreakpoint>
    </Flex>
  );
};
