export default [
  {
    path: '/home',
    component: './Home',
  },
  {
    path: '/',
    redirect: '/home',
  },
  {
    path: '/login/auth_callback',
    component: './Login/AuthCallback',
    hideInMenu: true,
    hideInBreadcrumb: true,
    headerRender: false,
    footerRender: false,
    menuHeaderRender: false,
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
    path: '/dao/:daoId/config/:configType?/:subType?',
    component: './Dao/Config',
  },
  {
    path: '/dao/:daoId',
    component: './Dao',
  },
  {
    path: '/job/:subType?',
    component: './Job',
  },
  {
    path: '/job2/:subType?',
    component: './Job',
  },
  {
    path: '/dao/:daoId/:cycleId/:voteType',
    component: './Dao/Vote',
  },
  {
    path: '/staking',
    component: './Staking',
  },
  {
    path: '/bind/discord/:tmpId',
    component: './Single/Discord',
    hideInMenu: true,
    hideInBreadcrumb: true,
    headerRender: false,
    footerRender: false,
    menuHeaderRender: false,
  },
  {
    component: './Result/404',
  },
];
