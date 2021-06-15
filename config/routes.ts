export default [
  {
    path: '/home',
    name: 'home',
    component: './Home',
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login/auth_callback',
    component: './Login/AuthCallback',
  },
  {
    path: '/account/icpper',
    component: './Account/Icpper',
  },
  {
    path: '/account/mentor',
    component: './Account/Mentor',
    access: 'hadMentor',
  },
  {
    path: '/account/wallet',
    component: './Account/Wallet',
    access: 'isNormal',
  },
  {
    path: '/dao/mine',
    component: './Dao/Mine',
    access: 'isNormal',
  },
  {
    path: '/dao/explore',
    component: './Dao/Explore',
    access: 'isNormal',
  },
  {
    path: '/dao/create',
    component: './Dao/Create',
    access: 'isNormal',
  },
  {
    path: '/dao/:daoId/config',
    component: './Dao/Config',
  },
  {
    path: '/dao/:daoId',
    component: './Dao',
  },
  {
    path: '/job',
    component: './Job',
  },
  {
    component: './404',
  },
];
