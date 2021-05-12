import {getUserInfo} from "@/utils/utils";

/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access() {
  const { profile } = getUserInfo();
  return {
    isIcpper: profile && profile.status === 2,
    isPreIcpper: profile && profile.status === 1,
    isNormal: profile && profile.status === 0,
    hadMentor: profile && profile.icppership && profile.icppership.mentor && profile.icppership.mentor.github_login,
  };
}
