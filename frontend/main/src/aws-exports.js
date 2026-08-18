export default {
  aws_project_region: import.meta.env.VITE_VUE_APP_AWS_REGION,
  aws_cognito_region: import.meta.env.VITE_VUE_APP_AWS_REGION,
  aws_user_pools_id: import.meta.env.VITE_VUE_APP_AWS_USER_POOLS_ID,
  aws_user_pools_web_client_id: import.meta.env.VITE_VUE_APP_AWS_USER_POOLS_WEB_CLIENT_ID,
  oauth: {
    domain: import.meta.env.VITE_VUE_APP_AWS_OAUTH_DOMAIN,
    scope: [
      'email',
      'openid',
      'profile',
      'aws.cognito.signin.user.admin',
    ],
    // this url needs to match exactly with the url in Cognito application callback url
    redirectSignIn: `${import.meta.env.VITE_VUE_APP_BASE_URL}login/`,
    redirectSignOut: `${import.meta.env.VITE_VUE_APP_BASE_URL}login/`,
    responseType: 'code',
  },
  federationTarget: 'COGNITO_USER_POOLS',
  Auth: {},
  authenticationFlowType: 'USER_PASSWORD_AUTH',
};
