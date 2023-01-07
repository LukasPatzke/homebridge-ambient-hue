import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ErrorPage } from './data/errorPage';
import { BrightnessCurvePage } from './pages/curves/brightness';
import { ColorTemperatureCurvePage } from './pages/curves/colorTemperature';
// import { Lights } from './routes/accessories';
import { ModalsProvider } from '@mantine/modals';
import {
  NotificationsProvider,
  showNotification,
} from '@mantine/notifications';
import { SWRConfig } from 'swr';
import { RootIndexPage } from './pages';
import { GroupPage } from './pages/groups/group';
import { LightPage } from './pages/lights/light';
import { RootPage } from './pages/root';
const routes = [
  {
    path: '/',
    element: <RootPage />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <RootIndexPage />,
        errorElement: <ErrorPage />,
      },

      {
        path: 'groups/:groupId',
        element: <GroupPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'groups/:groupId/:lightId',
        element: <LightPage />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'curves/brightness/:curveId',
        element: <BrightnessCurvePage />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'curves/colorTemperature/:curveId',
        element: <ColorTemperatureCurvePage />,
        errorElement: <ErrorPage />,
      },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function App() {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    systemColorScheme,
  );

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <NotificationsProvider>
          <ModalsProvider>
            <SWRConfig
              value={{
                onError(err, key, config) {
                  showNotification({
                    title: err.message,
                    message: err.description || err.status,
                    color: 'red',
                  });
                },
                shouldRetryOnError(err) {
                  return err.status !== 404;
                },
              }}
            >
              <RouterProvider router={router} />
            </SWRConfig>
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
