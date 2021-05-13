import {getUserInfo} from "@/utils/utils";

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access() {
  return {
    isNormal: getUserInfo().profile,
    isIcpper: getUserInfo().profile?.status === 2,
    isPreIcpper: getUserInfo().profile?.status === 1,
    hadMentor: getUserInfo().profile?.icppership?.mentor?.github_login,
  };
}
