import {getUserInfo} from "@/utils/utils";

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access() {
  return {
    isNormal: getUserInfo().profile,
    hadAccept: getUserInfo().profile && getUserInfo().profile.progress !== 0,
    isIcpper: getUserInfo().profile?.status === 2,
    isPreIcpper: getUserInfo().profile?.status === 1,
    hadMentor: getUserInfo().profile?.progress !== 0 && getUserInfo().profile?.icppership?.mentor?.github_login,
  };
}
