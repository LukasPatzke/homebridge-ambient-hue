import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, IonToast, isPlatform, setupIonicReact  } from '@ionic/react';
import { IonReactHashRouter as IonReactRouter } from '@ionic/react-router';
import { bulb, home } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Redirect, Route } from 'react-router-dom';
import PageGroupDetail from './pages/PageGroupDetail';
import PageGroups from './pages/PageGroups';
import PageLightDetail from './pages/PageLightDetail';
import PageLights from './pages/PageLights';
import TabStart from './pages/TabStart';
import PageCurves from './pages/PageCurves';
import PageCurveDetail from './pages/PageCurveDetail';
import * as serviceWorker from './serviceWorker';
import appIcon from './icons/icon-bold.svg';
import Room from './icons/room.svg';
/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
// /* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
// /* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/typography.css';
/* Theme variables */
import './theme/variables.css';
import './theme/ui.css';

setupIonicReact();

const App: React.FC = () => {
  const [serviceWorkerInitialized, setServiceWorkerInitialized] = useState(false);
  const [serviceWorkerUpdated, setServiceWorkerUpdated] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration>();
  const { t } = useTranslation('common');

  useEffect(()=>{
    if (process.env.NODE_ENV==='production') {
      serviceWorker.register({
        onSuccess: ()=>setServiceWorkerInitialized(true),
        onUpdate: (reg)=>{
          setServiceWorkerRegistration(reg);
          setServiceWorkerUpdated(true);
        }
      })
    }
  }, []);


  const tabBarSlot = isPlatform('mobile')?'bottom':'top'
  const tabBarLayout = isPlatform('mobile')?'icon-top':'icon-start'
  return (
    <IonApp>
      <IonToast
        isOpen={serviceWorkerInitialized}
        onDidDismiss={() => setServiceWorkerInitialized(false)}
        message={t('serviceWorker.initialized')}
        position='top'
        duration={5000}
      />
      <IonToast
        isOpen={serviceWorkerUpdated}
        message={t('serviceWorker.updated')}
        position='top'
        buttons={[
          {
            text: t('actions.update'),
            handler: () => {
              const registrationWaiting = serviceWorkerRegistration?.waiting;
              if (registrationWaiting) {
                registrationWaiting.postMessage({ type: 'SKIP_WAITING' });
                registrationWaiting.addEventListener('statechange', (e: any) => {
                  if (e.target.state === 'activated') {
                    window.location.reload();
                  }
                });
              }
            }
          }
        ]}
      />
      <IonReactRouter >
        <IonTabs>
          <IonRouterOutlet >
            <Route exact path="/" render={() => <Redirect to="/start" />} />
            <Route exact path="/:tab(start)" component={TabStart} />
            <Route exact path='/:tab(lights)' component={PageLights} />
            <Route exact path='/:tab(lights)/:id' component={PageLightDetail} />
            <Route exact path="/:tab(groups)" component={PageGroups} />
            <Route exact path='/:tab(groups)/:id' component={PageGroupDetail} />
            <Route exact path="/:tab(curves)" component={PageCurves} />
            <Route exact path="/:tab(curves)/:id" component={PageCurveDetail} />
          </IonRouterOutlet>
          <IonTabBar slot={tabBarSlot} >
            <IonTabButton tab="start" href="/start" layout={tabBarLayout}>
              <IonIcon icon={home} />
              <IonLabel>{t('tabs.home')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="lights" href="/lights" layout={tabBarLayout}>
              <IonIcon icon={bulb} />
              <IonLabel>{t('tabs.lights')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="groups" href="/groups" layout={tabBarLayout}>
              <IonIcon icon={Room} />
              <IonLabel>{t('tabs.groups')}</IonLabel>
            </IonTabButton>
            <IonTabButton tab="curves" href="/curves" layout={tabBarLayout}>
              <IonIcon src={appIcon} />
              <IonLabel>{t('tabs.curves')}</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
)};

export default App;
