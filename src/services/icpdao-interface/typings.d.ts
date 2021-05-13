// @ts-ignore
/* eslint-disable */

declare namespace API {
  type GithubCallback = {
    jwt?: string;
  };

  type UserStatus = 0 | 1 | 2;

  type IcpperShip = {
    id?: string;
    progress?: 0 | 1 | 2;
    status?: UserStatus;
    mentor?: IcpperShipMentor;
  };

  type UserProfile = {
    nickname?: string;
    avatar?: string;
    github_login?: string;
    status?: UserStatus;
    icppership?: IcpperShip;
    erc20_address?: string;
  };

  type InviteResults = InviteResult[];

  type InviteResult = {
    id?: string;
    progress?: 0 | 1 | 2;
    status?: UserStatus;
    mentor_github_login?: string;
    icpper?: InviteResultIcpper;
    create_at?: number;
    accept_at?: number;
    icpper_at?: number;
  };

  type ErrorResponse = {
    /** 业务约定的错误码 */
    errorCode: string;
    /** 业务上的错误信息 */
    errorMessage?: string;
    /** 业务上的请求是否成功 */
    success?: boolean;
  };

  type inlineResponse200 = {
    success?: boolean;
    data?: GithubCallback;
  };

  type inlineResponse2001 = {
    success?: boolean;
    data?: UserProfile;
  };

  type inlineResponse2002 = {
    success?: boolean;
    data?: InviteResult;
  };

  type inlineResponse2003 = {
    success?: boolean;
    data?: InviteResults;
  };

  type body = {
    icpper_github_login?: string;
  };

  type inlineResponse2004 = {
    success?: boolean;
    data?: Record<string, any>;
  };

  type IcpperShipMentor = {
    nickname?: string;
    github_login?: string;
    avatar?: string;
    number_of_instructors?: number;
  };

  type InviteResultIcpper = {
    nickname?: string;
    github_login?: string;
  };
}
