export type Access = AccessEnum;

export enum AccessEnum {
  NOLOGIN = 0,
  NOMARL = 1,
  PREICPPER = 2,
  ICPPER = 3,
  OWNER = 4,
}

export default function access(initialState: { currentUser: any }) {
  const { currentUser } = initialState;
  return {
    noLogin: () => currentUser().profile?.id === undefined,
    isLogin: () => currentUser().profile?.id !== undefined,
    isNormal: () => currentUser().profile?.status === 0,
    isPreIcpper: () => currentUser().profile?.status === 1,
    isIcpper: () => currentUser().profile?.status === 2,
    isPreIcpperOrIcpper: () =>
      currentUser().profile?.status === 1 || currentUser().profile?.status === 2,
    canInviteIcpper: () =>
      currentUser().profile?.status === 1 || currentUser().profile?.status === 2,
    hadMentor: () =>
      currentUser().profile?.icppership?.progress === 1 &&
      currentUser().profile?.icppership?.mentor?.github_login,
    isDaoOwner: (ownerId: string) => currentUser().profile?.id === ownerId,
    getAccess: (ownerId?: string) => {
      if (currentUser().profile?.id === undefined) return AccessEnum.NOLOGIN;
      if (currentUser().profile?.status === 0) return AccessEnum.NOMARL;
      if (currentUser().profile?.status === 1) return AccessEnum.PREICPPER;
      if (currentUser().profile?.status === 2) return AccessEnum.ICPPER;
      if (currentUser().profile?.id === ownerId) return AccessEnum.OWNER;
      return AccessEnum.NOLOGIN;
    },
  };
}
