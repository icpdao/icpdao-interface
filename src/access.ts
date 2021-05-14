import {getUserInfo} from "@/utils/utils";

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access() {
  return {
    isNormal: getUserInfo().profile,
    hadAccept: getUserInfo().profile?.icppership?.progress !== 0 &&
      getUserInfo().profile?.icppership?.progress !== undefined,
    hadMentor: getUserInfo().profile?.icppership?.progress !== 0 &&
      getUserInfo().profile?.icppership?.progress !== undefined &&
      getUserInfo().profile?.icppership?.mentor?.github_login,
  };
}
