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
  },
  {
    path: '/account/wallet',
    component: './Account/Wallet',
  },
  {
    path: '/dao/mine',
    component: './Dao/Mine',
  },
  {
    path: '/dao/explore',
    component: './Dao/Explore',
  },
  {
    path: '/dao/create',
    component: './Dao/Create',
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
    path: '/dao/:daoId/:cycleId/vote',
    component: './Dao/Vote',
  },
  {
    path: '/staking',
    component: './Staking',
  },
  {
    component: './Result/404',
  },
];
