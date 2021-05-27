export default function access(initialState: { currentUser: any }) {
  const { currentUser } = initialState;
  return {
    isNormal: currentUser().profile,
    canInviteIcpper: () =>
      (currentUser().profile?.icppership?.progress !== 0 &&
        currentUser().profile?.icppership?.progress !== undefined) ||
      currentUser().profile?.status === 2,
    hadMentor: () =>
      currentUser().profile?.icppership?.progress !== 0 &&
      currentUser().profile?.icppership?.progress !== undefined &&
      currentUser().profile?.icppership?.mentor?.github_login,
  };
}
