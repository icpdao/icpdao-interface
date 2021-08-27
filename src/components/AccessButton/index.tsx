import React, { useCallback, useMemo, useState } from 'react';
import { Button } from 'antd';
import type { ButtonProps } from 'antd/lib/button/button';
import { useAccess } from '@@/plugin-access/access';
import { getGithubOAuthUrl } from '@/components/RightHeader/AvatarDropdown';
import MentorWarningModal from './MentorWarningModal';
import type { Access } from '@/access';
import { AccessEnum } from '@/access';

type AccessButtonProps = ButtonProps &
  React.RefAttributes<HTMLElement> & {
    allow: Access;
    defaultWarningModal?: boolean;
    ownerId?: string;
  };

const AccessButton: React.FC<AccessButtonProps> = (props) => {
  const { allow, onClick, ownerId, defaultWarningModal } = props;

  const access = useAccess();

  const userAccess = useMemo(() => {
    return access.getAccess(ownerId);
  }, [access, ownerId]);

  const [warningModalVisible, setWarningModalVisible] = useState(defaultWarningModal || false);
  const warningModal = useMemo(() => {
    // can have like IcpperWarningModal, PreIcpperWarningModal ...
    return (
      <MentorWarningModal
        key={'warningModal'}
        visible={warningModalVisible}
        setVisible={setWarningModalVisible}
      />
    );
  }, [warningModalVisible]);

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
        setWarningModalVisible(true);
        // return
      }
      // can have like `icpper` access action and more.
      // return
    },
    [allow, onClick, userAccess],
  );

  return (
    <>
      {warningModal}
      <Button {...props} onClick={accessClick} />
    </>
  );
};

export default AccessButton;
