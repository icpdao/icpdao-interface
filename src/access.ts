export default function access(initialState: { currentUser: any }) {
  const { currentUser } = initialState;
  return {
    noLogin: () => currentUser().profile?.id === undefined,
    isLogin: () => currentUser().profile?.id !== undefined,
    isNormal: () => currentUser().profile?.status === 0,
    isIcpper: () => currentUser().profile?.status === 2,
    isPreIcpperOrIcpper: () =>
      currentUser().profile?.status === 1 || currentUser().profile?.status === 2,
    canInviteIcpper: () =>
      (currentUser().profile?.icppership?.progress !== 0 &&
        currentUser().profile?.icppership?.progress !== undefined) ||
      currentUser().profile?.status === 2,
    hadMentor: () =>
      currentUser().profile?.icppership?.progress !== 0 &&
      currentUser().profile?.icppership?.progress !== undefined &&
      currentUser().profile?.icppership?.mentor?.github_login,
    isDaoOwner: (ownerId: string) => currentUser().profile?.id === ownerId,
  };
}
