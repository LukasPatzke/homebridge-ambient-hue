import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { CurvePage, loader as curveLoader } from './routes/curve';
import { CurvesPage, loader as curvesLoader } from './routes/curves';
import { ErrorPage } from './routes/error';
// import { Lights } from './routes/accessories';
import { GroupPage, loader as groupLoader } from './routes/group';
import { LightPage, loader as lightLoader } from './routes/light';
import { loader as rootloader, RootPage } from './routes/root';

const router = createBrowserRouter([
  {
    path: '/',
    element:  <RootPage/>,
    errorElement: <ErrorPage/>,
    loader: rootloader,
    children: [
      {
        path: '/groups/:groupId',
        element: <GroupPage/>,
        loader: groupLoader,
      },
      {
        path: '/groups/:groupId/lights/:lightId',
        element: <LightPage/>,
        loader: lightLoader,
      },
    ],
  },
  {
    path: '/curves',
    element: <CurvesPage/>,
    loader: curvesLoader,
    errorElement: <ErrorPage/>,
    children: [
      {
        path: '/curves/:curveId',
        element: <CurvePage/>,
        loader: curveLoader,
      },
    ],
  },

]);
export default function App() {
  const systemColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme);

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <RouterProvider router={router}/>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}