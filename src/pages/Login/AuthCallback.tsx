import React from 'react';
import {PageLoading} from '@ant-design/pro-layout';
import { history } from 'umi';
import { githubCallback } from "@/services/icpdao-interface/login";
import { setAuthorization} from "@/utils/utils";
import {useModel} from "@@/plugin-model/useModel";


const AuthCallback: React.FC<any> = (props) => {
  const { initialState } = useModel('@@initialState');
  githubCallback({code:props.location.query.code}).then((resp: any) => {
    if (resp.data.jwt) {
      setAuthorization(resp.data.jwt);
      if (initialState && initialState.fetchUserInfo) {
        initialState.fetchUserInfo().then(() => {history.replace('/');});
      }
    }
  })
  return <PageLoading />;
};

export default AuthCallback;
