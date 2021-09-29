import React, { useEffect, useRef } from 'react';
import { PageLoading } from '@ant-design/pro-layout';
import { history, useAccess } from 'umi';
import { githubCallback } from '@/services/icpdao-interface/login';
import {
  getRedirectURL,
  setAuthorization,
  setAuthorizationExpiresAt,
  setRedirectURL,
} from '@/utils/utils';
import { useModel } from '@@/plugin-model/useModel';
import { useUserVotingCycleQuery } from '@/services/dao/generated';

export const useCheckVotingCycle = () => {
  const access = useAccess();
  const { refetch } = useUserVotingCycleQuery({
    skip: true,
    fetchPolicy: 'no-cache',
  });

  useEffect(() => {
    (async () => {
      if (access.isLogin()) {
        const { data } = await refetch();
        const datum = data?.votingCycle?.datum;
        if (datum?.id && datum?.daoId) {
          history.push(`/dao/${datum?.daoId}/${datum?.id}/vote/`);
        }
      }
    })();
  }, [access, refetch]);

  return null;
};

const AuthCallback: React.FC<any> = (props) => {
  const { initialState, refresh } = useModel('@@initialState');
  const callGithub = useRef(false);
  useCheckVotingCycle();

  useEffect(() => {
    (async () => {
      if (callGithub.current) {
        return;
      }
      const resp = await githubCallback({ code: props.location.query.code });
      callGithub.current = true;
      if (resp?.data?.jwt) {
        setAuthorization(resp.data.jwt);
        setAuthorizationExpiresAt(resp.data.expires_at || 0);
        if (initialState && initialState.fetchUserInfo) {
          await initialState.fetchUserInfo();
          await refresh();
          const re = getRedirectURL();
          if (re && re !== '') {
            setRedirectURL('');
            console.log({ re });
            history.push(re);
          } else {
            history.replace('/');
          }
        }
      }
    })();
  }, [initialState, props.location.query.code, refresh]);

  return <PageLoading />;
};

export default AuthCallback;
