import React, { useCallback, useMemo } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd/lib/button/button';
import { useAccess } from '@@/plugin-access/access';
import { getGithubOAuthUrl } from '@/components/RightHeader/AvatarDropdown';
import type { Access } from '@/access';
import { AccessEnum } from '@/access';

type AccessButtonProps = ButtonProps &
  React.RefAttributes<HTMLElement> & {
    allow: Access;
    ownerId?: string;
  };

const AccessButton: React.FC<AccessButtonProps> = ({ allow, onClick, ownerId, ...props }) => {
  const access = useAccess();

  const userAccess = useMemo(() => {
    return access.getAccess(ownerId);
  }, [access, ownerId]);

  const accessClick = useCallback(
    async (e) => {
      if (!onClick) return;
      if (userAccess >= allow) {
        await onClick(e);
        return;
      }
      if (userAccess === AccessEnum.NOLOGIN) {
        window.open(getGithubOAuthUrl(), '_self');
        return;
      }
      if (userAccess === AccessEnum.NOMARL) {
        // setWarningModalVisible(true);
        // return
      }
      // can have like `icpper` access action and more.
      // return
    },
    [allow, onClick, userAccess],
  );

  return (
    <>
      <Button {...props} onClick={accessClick} />
    </>
  );
};

export default AccessButton;
