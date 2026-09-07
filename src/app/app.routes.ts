import { Routes } from '@angular/router';

import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { MenuBar } from './components/menubar/menu';
import { LegalFiles } from './components/legal-files/legal-files';
import { Dashboard } from './components/dashboard/dashboard';
import { ProofOfServiceComponent } from './components/proof-of-service/proof-of-service';
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
    path: 'menubar',
    component: MenuBar,
    children: [

       // DEFAULT PAGE INSIDE MENUBAR
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      {
        path: 'dashboard',
        component: Dashboard
      },

      {
        path: 'legal-files',
        component: LegalFiles
      },

      {
      path: 'proof-of-service',
      component: ProofOfServiceComponent
    }


    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];