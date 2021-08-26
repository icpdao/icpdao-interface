import React, { useEffect } from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { history } from 'umi';
import { githubCallback } from '@/services/icpdao-interface/login';
import { setAuthorization } from '@/utils/utils';
import { useModel } from '@@/plugin-model/useModel';

const AuthCallback: React.FC<any> = (props) => {
  const { initialState, refresh } = useModel('@@initialState');

  useEffect(() => {
    (async () => {
      const resp = await githubCallback({ code: props.location.query.code });
      if (resp?.data?.jwt) {
        setAuthorization(resp.data.jwt);
        if (initialState && initialState.fetchUserInfo) {
          await initialState.fetchUserInfo();
          await refresh();
          history.replace('/');
        }
      }
    })();
  }, [initialState, props.location.query.code, refresh]);

  return <PageLoading />;
};

export default AuthCallback;
