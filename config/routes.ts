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
    access: 'canInviteIcpper',
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
    path: '/dao/create',
    component: './Dao/Create',
    access: 'isNormal',
  },
  {
    component: './404',
  },
];
