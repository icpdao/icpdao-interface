module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
    REACT_APP_GITHUB_APP_CLIENT_ID: 'readonly',
    REACT_APP_ICPDAO_BACKEND_BASE_URL: 'readonly',
    THEME: true,
    REACT_APP_ICPDAO_BACKEND_VERSION: true,
  },
};
