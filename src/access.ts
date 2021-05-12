import {getUserInfo} from "@/utils/utils";

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access() {
  return {
    isIcpper: () => getUserInfo().profile?.status === 2,
    isPreIcpper: () => getUserInfo().profile?.status === 1,
    isNormal: () => getUserInfo().profile?.status !== undefined,
    hadMentor: () => getUserInfo().profile?.icppership?.mentor?.github_login,
  };
}
