import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Dashboard } from './components/dashboard/dashboard';
import { LegalFiles } from './components/legal-files/legal-files';
// import { Home } from './components/home/home';
// import { Cases } from './components/cases/cases';
// import { Settings } from './components/settings/settings';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: 'login',
    component: Login
  },

  {
    path: 'register',
    component: Register
  },

  {
    path: 'dashboard',
    component: Dashboard,
    children: [

      // {
      //   path: 'home',
      //   component: Home
      // },

      {
        path: 'legal-files',
        component: LegalFiles
      },

      // {
      //   path: 'cases',
      //   component: Cases
      // },

      // {
      //   path: 'settings',
      //   component: Settings
      // },

    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];