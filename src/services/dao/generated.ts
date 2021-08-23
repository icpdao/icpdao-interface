import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = { context: { service: 'dao' } };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `Decimal` scalar type represents a python Decimal. */
  Decimal: any;
};

export type ChangeVoteResultPublic = {
  __typename?: 'ChangeVoteResultPublic';
  ok?: Maybe<Scalars['Boolean']>;
};

export type CreateCycleVotePairTaskByOwner = {
  __typename?: 'CreateCycleVotePairTaskByOwner';
  status?: Maybe<CreateCycleVoteResultStatTaskByOwnerStatusEnum>;
};

export type CreateCycleVoteResultPublishTaskByOwner = {
  __typename?: 'CreateCycleVoteResultPublishTaskByOwner';
  status?: Maybe<CreateCycleVoteResultPublishTaskByOwnerStatusEnum>;
};

export enum CreateCycleVoteResultPublishTaskByOwnerStatusEnum {
  Init = 'INIT',
  Running = 'RUNNING',
  Success = 'SUCCESS',
  Fail = 'FAIL',
}

export type CreateCycleVoteResultStatTaskByOwner = {
  __typename?: 'CreateCycleVoteResultStatTaskByOwner';
  status?: Maybe<CreateCycleVoteResultStatTaskByOwnerStatusEnum>;
};

export enum CreateCycleVoteResultStatTaskByOwnerStatusEnum {
  Init = 'INIT',
  Stating = 'STATING',
  Success = 'SUCCESS',
  Fail = 'FAIL',
}

/** example: https://docs.graphene-python.org/en/latest/types/mutations/ */
export type CreateDao = {
  __typename?: 'CreateDAO';
  dao?: Maybe<DaoSchema>;
};

export type CreateJob = {
  __typename?: 'CreateJob';
  job?: Maybe<Job>;
};

export type CreateMock = {
  __typename?: 'CreateMock';
  ok?: Maybe<Scalars['Boolean']>;
};

export type CycleByTokenUnreleasedQuery = {
  __typename?: 'CycleByTokenUnreleasedQuery';
  nodes?: Maybe<Array<Maybe<CycleQuery>>>;
};

export enum CycleFilterEnum {
  Processing = 'processing',
  Pairing = 'pairing',
  Voting = 'voting',
  UnVoteEnd = 'un_vote_end',
}

export type CycleIcpperStatSchema = {
  __typename?: 'CycleIcpperStatSchema';
  beDeductedSizeByReview?: Maybe<Scalars['Float']>;
  createAt: Scalars['Int'];
  cycleId: Scalars['String'];
  daoId: Scalars['String'];
  ei: Scalars['Float'];
  haveTwoTimesLt04?: Maybe<Scalars['Boolean']>;
  haveTwoTimesLt08?: Maybe<Scalars['Boolean']>;
  /** _id */
  id?: Maybe<Scalars['ID']>;
  income: Scalars['Float'];
  jobCount: Scalars['Int'];
  jobSize: Scalars['Float'];
  lastId?: Maybe<Scalars['String']>;
  ownerEi: Scalars['Float'];
  size: Scalars['Float'];
  unVotedAllVote?: Maybe<Scalars['Boolean']>;
  updateAt: Scalars['Int'];
  userId: Scalars['String'];
  voteEi: Scalars['Float'];
};

export enum CycleIcpperStatSortedEnum {
  JobCount = 'jobCount',
  Size = 'size',
  Income = 'income',
}

export enum CycleIcpperStatSortedTypeEnum {
  Asc = 'asc',
  Desc = 'desc',
}

export type CycleQuery = {
  __typename?: 'CycleQuery';
  datum?: Maybe<CycleSchema>;
  stat?: Maybe<CycleStatQuery>;
  icpperStats?: Maybe<IcpperStatsQuery>;
  jobs?: Maybe<JobsQuery>;
  votes?: Maybe<CycleVotesQuery>;
  pairTask?: Maybe<CycleVotePairTaskQuery>;
  voteResultStatTask?: Maybe<CycleVoteResultStatTaskQuery>;
  voteResultPublishTask?: Maybe<CycleVoteResultPublishTaskQuery>;
};

export type CycleQueryIcpperStatsArgs = {
  sorted?: Maybe<CycleIcpperStatSortedEnum>;
  sortedType?: Maybe<CycleIcpperStatSortedTypeEnum>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type CycleQueryJobsArgs = {
  pairType?: Maybe<JobsQueryPairTypeEnum>;
  sorted?: Maybe<JobsQuerySortedEnum>;
  sortedType?: Maybe<JobsQuerySortedTypeEnum>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type CycleQueryVotesArgs = {
  isPublic?: Maybe<Scalars['Boolean']>;
  isMyself?: Maybe<Scalars['Boolean']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type CycleSchema = {
  __typename?: 'CycleSchema';
  beginAt: Scalars['Int'];
  createAt: Scalars['Int'];
  daoId: Scalars['String'];
  endAt: Scalars['Int'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  pairBeginAt: Scalars['Int'];
  pairEndAt: Scalars['Int'];
  pairedAt?: Maybe<Scalars['Int']>;
  timeZone: Scalars['Int'];
  tokenReleasedAt?: Maybe<Scalars['Int']>;
  updateAt: Scalars['Int'];
  voteBeginAt: Scalars['Int'];
  voteEndAt: Scalars['Int'];
  voteResultPublishedAt?: Maybe<Scalars['Int']>;
  voteResultStatAt?: Maybe<Scalars['Int']>;
};

export type CycleStatQuery = {
  __typename?: 'CycleStatQuery';
  icpperCount?: Maybe<Scalars['Int']>;
  jobCount?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['Decimal']>;
};

export type CycleVotePairTaskQuery = {
  __typename?: 'CycleVotePairTaskQuery';
  status?: Maybe<CycleVotePairTaskStatusEnum>;
};

export enum CycleVotePairTaskStatusEnum {
  Init = 'INIT',
  Pairing = 'PAIRING',
  Success = 'SUCCESS',
  Fail = 'FAIL',
}

export type CycleVoteQuery = {
  __typename?: 'CycleVoteQuery';
  datum?: Maybe<CycleVoteSchema>;
  leftJob?: Maybe<JobItemQuery>;
  rightJob?: Maybe<JobItemQuery>;
  voteJob?: Maybe<JobItemQuery>;
  voter?: Maybe<UserSchema>;
  selfVoteResultTypeAll?: Maybe<CycleVoteResultTypeAllResultTypeEnum>;
};

export type CycleVoteResultPublishTaskQuery = {
  __typename?: 'CycleVoteResultPublishTaskQuery';
  status?: Maybe<CycleVoteResultPublishTaskStatusEnum>;
};

export enum CycleVoteResultPublishTaskStatusEnum {
  Init = 'INIT',
  Running = 'RUNNING',
  Success = 'SUCCESS',
  Fail = 'FAIL',
}

export type CycleVoteResultStatTaskQuery = {
  __typename?: 'CycleVoteResultStatTaskQuery';
  status?: Maybe<CycleVoteResultStatTaskStatusEnum>;
};

export enum CycleVoteResultStatTaskStatusEnum {
  Init = 'INIT',
  Stating = 'STATING',
  Success = 'SUCCESS',
  Fail = 'FAIL',
}

export enum CycleVoteResultTypeAllResultTypeEnum {
  Yes = 'YES',
  No = 'NO',
}

export type CycleVoteSchema = {
  __typename?: 'CycleVoteSchema';
  createAt: Scalars['Int'];
  cycleId: Scalars['String'];
  daoId: Scalars['String'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  isResultPublic: Scalars['Boolean'];
  leftJobId: Scalars['String'];
  rightJobId: Scalars['String'];
  updateAt: Scalars['Int'];
  voteJobId?: Maybe<Scalars['String']>;
  voteResultStatTypeAll?: Maybe<Scalars['Int']>;
  voteType: Scalars['Int'];
  voterId?: Maybe<Scalars['String']>;
};

export type CycleVotesQuery = {
  __typename?: 'CycleVotesQuery';
  nodes?: Maybe<Array<Maybe<CycleVoteQuery>>>;
  confirm?: Maybe<Scalars['Boolean']>;
  total?: Maybe<Scalars['Int']>;
};

export type CyclesQuery = {
  __typename?: 'CyclesQuery';
  nodes?: Maybe<Array<Maybe<CycleQuery>>>;
};

export type Dao = {
  __typename?: 'DAO';
  datum?: Maybe<DaoSchema>;
  following?: Maybe<DaoFollowUdSchema>;
  cycles?: Maybe<CyclesQuery>;
};

export type DaoCyclesArgs = {
  filter?: Maybe<Array<Maybe<CycleFilterEnum>>>;
};

export type DaoFollowSchema = {
  __typename?: 'DAOFollowSchema';
  createAt: Scalars['Int'];
  daoId: Scalars['String'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  userId: Scalars['String'];
};

export enum DaoFollowTypeEnum {
  Add = 'ADD',
  Delete = 'DELETE',
}

export type DaoFollowUdSchema = {
  __typename?: 'DAOFollowUDSchema';
  daoId: Scalars['String'];
  followers?: Maybe<Array<Maybe<DaoFollowSchema>>>;
  total: Scalars['Int'];
};

export type DaoFollowUdSchemaFollowersArgs = {
  userId?: Maybe<Scalars['String']>;
};

export type DaoGithubAppStatus = {
  __typename?: 'DAOGithubAppStatus';
  githubAppName?: Maybe<Scalars['String']>;
  githubOrgId?: Maybe<Scalars['Int']>;
  isExists?: Maybe<Scalars['Boolean']>;
  isGithubOrgOwner?: Maybe<Scalars['Boolean']>;
  isIcpAppInstalled?: Maybe<Scalars['Boolean']>;
};

export type DaoItem = {
  __typename?: 'DAOItem';
  datum?: Maybe<DaoSchema>;
  stat?: Maybe<DaoStat>;
  isFollowing: Scalars['Boolean'];
  isOwner: Scalars['Boolean'];
};

export type DaoJobConfig = {
  __typename?: 'DAOJobConfig';
  datum?: Maybe<DaoJobConfigSchema>;
  thisCycle?: Maybe<DaoJobThisCycle>;
  existedLastCycle?: Maybe<DaoJobCycle>;
  previewNextCycle?: Maybe<DaoJobCycle>;
  getNextCycle?: Maybe<DaoJobCycle>;
};

export type DaoJobConfigPreviewNextCycleArgs = {
  timeZone?: Maybe<Scalars['Int']>;
  deadlineDay?: Maybe<Scalars['Int']>;
  deadlineTime?: Maybe<Scalars['Int']>;
  pairBeginDay?: Maybe<Scalars['Int']>;
  pairBeginHour?: Maybe<Scalars['Int']>;
  pairEndDay?: Maybe<Scalars['Int']>;
  pairEndHour?: Maybe<Scalars['Int']>;
  votingBeginDay?: Maybe<Scalars['Int']>;
  votingBeginHour?: Maybe<Scalars['Int']>;
  votingEndDay?: Maybe<Scalars['Int']>;
  votingEndHour?: Maybe<Scalars['Int']>;
};

export type DaoJobConfigSchema = {
  __typename?: 'DAOJobConfigSchema';
  createAt: Scalars['Int'];
  daoId: Scalars['String'];
  deadlineDay: Scalars['Int'];
  deadlineTime: Scalars['Int'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  pairBeginDay: Scalars['Int'];
  pairBeginHour: Scalars['Int'];
  pairEndDay: Scalars['Int'];
  pairEndHour: Scalars['Int'];
  timeZone: Scalars['Int'];
  timeZoneRegion: Scalars['String'];
  updateAt: Scalars['Int'];
  votingBeginDay: Scalars['Int'];
  votingBeginHour: Scalars['Int'];
  votingEndDay: Scalars['Int'];
  votingEndHour: Scalars['Int'];
};

export type DaoJobCycle = {
  __typename?: 'DAOJobCycle';
  timeZone?: Maybe<Scalars['Int']>;
  beginAt?: Maybe<Scalars['Int']>;
  endAt?: Maybe<Scalars['Int']>;
  pairBeginAt?: Maybe<Scalars['Int']>;
  pairEndAt?: Maybe<Scalars['Int']>;
  voteBeginAt?: Maybe<Scalars['Int']>;
  voteEndAt?: Maybe<Scalars['Int']>;
};

export type DaoJobThisCycle = {
  __typename?: 'DAOJobThisCycle';
  timeZone?: Maybe<Scalars['Int']>;
  beginAt?: Maybe<Scalars['Int']>;
  endAt?: Maybe<Scalars['Int']>;
  pairBeginAt?: Maybe<Scalars['Int']>;
  pairEndAt?: Maybe<Scalars['Int']>;
  voteBeginAt?: Maybe<Scalars['Int']>;
  voteEndAt?: Maybe<Scalars['Int']>;
};

export type DaoSchema = {
  __typename?: 'DAOSchema';
  createAt: Scalars['Int'];
  desc?: Maybe<Scalars['String']>;
  githubOwnerId: Scalars['Int'];
  githubOwnerName: Scalars['String'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  number: Scalars['Int'];
  ownerId: Scalars['String'];
  tokenAddress?: Maybe<Scalars['String']>;
  updateAt: Scalars['Int'];
};

export type DaoStat = {
  __typename?: 'DAOStat';
  following?: Maybe<Scalars['Int']>;
  job?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['Float']>;
  token?: Maybe<Scalars['String']>;
};

export type DaoTokenConfig = {
  __typename?: 'DAOTokenConfig';
  ethDaoId?: Maybe<Scalars['String']>;
};

export type DaOs = {
  __typename?: 'DAOs';
  dao?: Maybe<Array<Maybe<DaoItem>>>;
  stat?: Maybe<DaOsStat>;
  total?: Maybe<Scalars['Int']>;
};

export enum DaOsFilterEnum {
  All = 'all',
  Owner = 'owner',
  Following = 'following',
  FollowingAndOwner = 'following_and_owner',
  Member = 'member',
}

export enum DaOsSortedEnum {
  Number = 'number',
  Following = 'following',
  Job = 'job',
  Size = 'size',
  Token = 'token',
}

export enum DaOsSortedTypeEnum {
  Asc = 'asc',
  Desc = 'desc',
}

export type DaOsStat = {
  __typename?: 'DAOsStat';
  icpper?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['Float']>;
  income?: Maybe<Scalars['Float']>;
};

export type DeleteJob = {
  __typename?: 'DeleteJob';
  ok?: Maybe<Scalars['Boolean']>;
};

export type IcpperStatQuery = {
  __typename?: 'IcpperStatQuery';
  datum?: Maybe<CycleIcpperStatSchema>;
  lastEi?: Maybe<Scalars['Decimal']>;
  icpper?: Maybe<UserSchema>;
  cycle?: Maybe<CycleSchema>;
  beReviewerHasWarningUsers?: Maybe<Array<Maybe<UserSchema>>>;
};

export type IcpperStatsQuery = {
  __typename?: 'IcpperStatsQuery';
  nodes?: Maybe<Array<Maybe<IcpperStatQuery>>>;
  total?: Maybe<Scalars['Int']>;
};

export type Job = {
  __typename?: 'Job';
  node?: Maybe<JobSchema>;
  prs?: Maybe<Array<Maybe<JobPrSchema>>>;
};

export type JobItemQuery = {
  __typename?: 'JobItemQuery';
  datum?: Maybe<JobSchema>;
  user?: Maybe<UserSchema>;
};

export type JobPrSchema = {
  __typename?: 'JobPRSchema';
  createAt: Scalars['Int'];
  githubPrNumber: Scalars['Int'];
  githubRepoId: Scalars['Int'];
  githubRepoName: Scalars['String'];
  githubRepoOwner: Scalars['String'];
  githubRepoOwnerId: Scalars['Int'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  jobId: Scalars['String'];
  mergedAt?: Maybe<Scalars['Int']>;
  mergedUserGithubUserId?: Maybe<Scalars['Int']>;
  status: Scalars['Int'];
  title: Scalars['String'];
  userId: Scalars['String'];
};

export type JobQuery = {
  __typename?: 'JobQuery';
  datum?: Maybe<JobSchema>;
  user?: Maybe<UserSchema>;
};

export type JobSchema = {
  __typename?: 'JobSchema';
  bodyText?: Maybe<Scalars['String']>;
  botCommentDatabaseId: Scalars['Int'];
  createAt: Scalars['Int'];
  cycleId?: Maybe<Scalars['String']>;
  daoId: Scalars['String'];
  githubIssueNumber: Scalars['Int'];
  githubRepoId: Scalars['Int'];
  githubRepoName: Scalars['String'];
  githubRepoOwner: Scalars['String'];
  githubRepoOwnerId: Scalars['Int'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  income: Scalars['Float'];
  labels?: Maybe<Array<Maybe<Scalars['String']>>>;
  pairType: Scalars['Int'];
  size: Scalars['Float'];
  status: Scalars['Int'];
  title: Scalars['String'];
  updateAt: Scalars['Int'];
  userId: Scalars['String'];
};

export enum JobSortedEnum {
  Size = 'size',
  Income = 'income',
}

export type Jobs = {
  __typename?: 'Jobs';
  job?: Maybe<Array<Maybe<Job>>>;
  stat?: Maybe<JobsStat>;
  total?: Maybe<Scalars['Int']>;
};

export type JobsQuery = {
  __typename?: 'JobsQuery';
  nodes?: Maybe<Array<Maybe<JobQuery>>>;
  total?: Maybe<Scalars['Int']>;
};

export enum JobsQueryPairTypeEnum {
  Pair = 'pair',
  All = 'all',
}

export enum JobsQuerySortedEnum {
  Size = 'size',
  Income = 'income',
}

export enum JobsQuerySortedTypeEnum {
  Asc = 'asc',
  Desc = 'desc',
}

export type JobsStat = {
  __typename?: 'JobsStat';
  size?: Maybe<Scalars['Float']>;
  tokenName?: Maybe<Scalars['String']>;
  tokenCount?: Maybe<Scalars['Float']>;
};

export type MarkCyclesTokenReleased = {
  __typename?: 'MarkCyclesTokenReleased';
  ok?: Maybe<Scalars['Boolean']>;
};

export type Mutations = {
  __typename?: 'Mutations';
  /** example: https://docs.graphene-python.org/en/latest/types/mutations/ */
  createDao?: Maybe<CreateDao>;
  updateDaoJobConfig?: Maybe<UpdateDaoJobConfig>;
  updateDaoFollow?: Maybe<UpdateDaoFollow>;
  updateDaoBaseInfo?: Maybe<UpdateDaoBaseInfo>;
  createJob?: Maybe<CreateJob>;
  updateJob?: Maybe<UpdateJob>;
  deleteJob?: Maybe<DeleteJob>;
  updateJobVoteTypeByOwner?: Maybe<UpdateJobVoteTypeByOwner>;
  updateIcpperStatOwnerEi?: Maybe<UpdateIcpperStatOwnerEi>;
  updatePairVote?: Maybe<UpdatePairVote>;
  updateAllVote?: Maybe<UpdateAllVote>;
  updateVoteConfirm?: Maybe<UpdateVoteConfirm>;
  createCycleVotePairTaskByOwner?: Maybe<CreateCycleVotePairTaskByOwner>;
  changeVoteResultPublic?: Maybe<ChangeVoteResultPublic>;
  createMock?: Maybe<CreateMock>;
  createCycleVoteResultStatTaskByOwner?: Maybe<CreateCycleVoteResultStatTaskByOwner>;
  createCycleVoteResultPublishTaskByOwner?: Maybe<CreateCycleVoteResultPublishTaskByOwner>;
  markCyclesTokenReleased?: Maybe<MarkCyclesTokenReleased>;
};

export type MutationsCreateDaoArgs = {
  desc: Scalars['String'];
  logo: Scalars['String'];
  name: Scalars['String'];
  timeZone: Scalars['Int'];
  timeZoneRegion: Scalars['String'];
};

export type MutationsUpdateDaoJobConfigArgs = {
  daoId: Scalars['String'];
  deadlineDay?: Maybe<Scalars['Int']>;
  deadlineTime?: Maybe<Scalars['Int']>;
  pairBeginDay?: Maybe<Scalars['Int']>;
  pairBeginHour?: Maybe<Scalars['Int']>;
  pairEndDay?: Maybe<Scalars['Int']>;
  pairEndHour?: Maybe<Scalars['Int']>;
  timeZone?: Maybe<Scalars['Int']>;
  timeZoneRegion?: Maybe<Scalars['String']>;
  votingBeginDay?: Maybe<Scalars['Int']>;
  votingBeginHour?: Maybe<Scalars['Int']>;
  votingEndDay?: Maybe<Scalars['Int']>;
  votingEndHour?: Maybe<Scalars['Int']>;
};

export type MutationsUpdateDaoFollowArgs = {
  daoId: Scalars['String'];
  type: DaoFollowTypeEnum;
};

export type MutationsUpdateDaoBaseInfoArgs = {
  desc?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  logo?: Maybe<Scalars['String']>;
  tokenAddress?: Maybe<Scalars['String']>;
};

export type MutationsCreateJobArgs = {
  issueLink: Scalars['String'];
  size: Scalars['Float'];
};

export type MutationsUpdateJobArgs = {
  addPr?: Maybe<Scalars['String']>;
  deletePr?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  size?: Maybe<Scalars['Float']>;
};

export type MutationsDeleteJobArgs = {
  id: Scalars['String'];
};

export type MutationsUpdateJobVoteTypeByOwnerArgs = {
  id: Scalars['String'];
  voteType?: Maybe<UpdateJobVoteTypeByOwnerArgumentPairTypeEnum>;
};

export type MutationsUpdateIcpperStatOwnerEiArgs = {
  id: Scalars['String'];
  ownerEi?: Maybe<Scalars['Decimal']>;
};

export type MutationsUpdatePairVoteArgs = {
  id: Scalars['String'];
  voteJobId: Scalars['String'];
};

export type MutationsUpdateAllVoteArgs = {
  id: Scalars['String'];
  vote: Scalars['Boolean'];
};

export type MutationsUpdateVoteConfirmArgs = {
  cycleId: Scalars['String'];
  signature: Scalars['String'];
  signatureAddress: Scalars['String'];
  signatureMsg: Scalars['String'];
};

export type MutationsCreateCycleVotePairTaskByOwnerArgs = {
  cycleId: Scalars['String'];
};

export type MutationsChangeVoteResultPublicArgs = {
  id: Scalars['String'];
  public: Scalars['Boolean'];
};

export type MutationsCreateMockArgs = {
  icpperGithubUserLogin: Scalars['String'];
  ownerGithubUserLogin: Scalars['String'];
};

export type MutationsCreateCycleVoteResultStatTaskByOwnerArgs = {
  cycleId: Scalars['String'];
};

export type MutationsCreateCycleVoteResultPublishTaskByOwnerArgs = {
  cycleId: Scalars['String'];
};

export type MutationsMarkCyclesTokenReleasedArgs = {
  cycleIds: Array<Maybe<Scalars['String']>>;
  daoId: Scalars['String'];
  unitSizeValue: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  daos?: Maybe<DaOs>;
  dao?: Maybe<Dao>;
  daoJobConfig?: Maybe<DaoJobConfig>;
  daoTokenConfig?: Maybe<DaoTokenConfig>;
  daoGithubAppStatus?: Maybe<DaoGithubAppStatus>;
  cycle?: Maybe<CycleQuery>;
  cyclesByTokenUnreleased?: Maybe<CycleByTokenUnreleasedQuery>;
  jobs?: Maybe<Jobs>;
  icpperStats?: Maybe<UserIcpperStatsQuery>;
};

export type QueryDaosArgs = {
  filter?: Maybe<DaOsFilterEnum>;
  sorted?: Maybe<DaOsSortedEnum>;
  sortedType?: Maybe<DaOsSortedTypeEnum>;
  search?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userName?: Maybe<Scalars['String']>;
};

export type QueryDaoArgs = {
  id?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
};

export type QueryDaoJobConfigArgs = {
  daoId: Scalars['String'];
};

export type QueryDaoTokenConfigArgs = {
  daoId: Scalars['String'];
};

export type QueryDaoGithubAppStatusArgs = {
  name: Scalars['String'];
};

export type QueryCycleArgs = {
  id: Scalars['String'];
};

export type QueryCyclesByTokenUnreleasedArgs = {
  lastTimestamp: Scalars['Int'];
};

export type QueryJobsArgs = {
  daoName?: Maybe<Scalars['String']>;
  beginTime?: Maybe<Scalars['Int']>;
  endTime?: Maybe<Scalars['Int']>;
  sorted?: Maybe<JobSortedEnum>;
  sortedType?: Maybe<SortedTypeEnum>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  userName?: Maybe<Scalars['String']>;
};

export type QueryIcpperStatsArgs = {
  daoName?: Maybe<Scalars['String']>;
  userName?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export enum SortedTypeEnum {
  Asc = 'asc',
  Desc = 'desc',
}

export type UpdateAllVote = {
  __typename?: 'UpdateALLVote';
  ok?: Maybe<Scalars['Boolean']>;
};

export type UpdateDaoBaseInfo = {
  __typename?: 'UpdateDAOBaseInfo';
  dao?: Maybe<DaoSchema>;
};

export type UpdateDaoFollow = {
  __typename?: 'UpdateDAOFollow';
  ok?: Maybe<Scalars['Boolean']>;
};

export type UpdateDaoJobConfig = {
  __typename?: 'UpdateDAOJobConfig';
  ok?: Maybe<Scalars['Boolean']>;
};

export type UpdateIcpperStatOwnerEi = {
  __typename?: 'UpdateIcpperStatOwnerEi';
  ei?: Maybe<Scalars['Decimal']>;
  voteEi?: Maybe<Scalars['Decimal']>;
  ownerEi?: Maybe<Scalars['Decimal']>;
};

export type UpdateJob = {
  __typename?: 'UpdateJob';
  job?: Maybe<Job>;
};

export type UpdateJobVoteTypeByOwner = {
  __typename?: 'UpdateJobVoteTypeByOwner';
  ok?: Maybe<Scalars['Boolean']>;
};

export enum UpdateJobVoteTypeByOwnerArgumentPairTypeEnum {
  Pair = 'pair',
  All = 'all',
}

export type UpdatePairVote = {
  __typename?: 'UpdatePairVote';
  ok?: Maybe<Scalars['Boolean']>;
};

export type UpdateVoteConfirm = {
  __typename?: 'UpdateVoteConfirm';
  ok?: Maybe<Scalars['Boolean']>;
};

export type UserIcpperStatsQuery = {
  __typename?: 'UserIcpperStatsQuery';
  nodes?: Maybe<Array<Maybe<IcpperStatQuery>>>;
  total?: Maybe<Scalars['Int']>;
};

export type UserSchema = {
  __typename?: 'UserSchema';
  avatar: Scalars['String'];
  createAt: Scalars['Int'];
  erc20Address?: Maybe<Scalars['String']>;
  githubLogin: Scalars['String'];
  githubUserId: Scalars['Int'];
  /** _id */
  id?: Maybe<Scalars['ID']>;
  nickname: Scalars['String'];
  status: Scalars['Int'];
};

export type CreateDaoMutationVariables = Exact<{
  name: Scalars['String'];
  desc: Scalars['String'];
  logo: Scalars['String'];
  timeZone: Scalars['Int'];
  timeZoneRegion: Scalars['String'];
}>;

export type CreateDaoMutation = { __typename?: 'Mutations' } & {
  createDao?: Maybe<
    { __typename?: 'CreateDAO' } & {
      dao?: Maybe<{ __typename?: 'DAOSchema' } & Pick<DaoSchema, 'id' | 'number' | 'createAt'>>;
    }
  >;
};

export type UpdateDaoJobConfigMutationVariables = Exact<{
  daoId: Scalars['String'];
  deadlineDay?: Maybe<Scalars['Int']>;
  deadlineTime?: Maybe<Scalars['Int']>;
  pairBeginDay?: Maybe<Scalars['Int']>;
  pairBeginHour?: Maybe<Scalars['Int']>;
  pairEndDay?: Maybe<Scalars['Int']>;
  pairEndHour?: Maybe<Scalars['Int']>;
  votingBeginDay?: Maybe<Scalars['Int']>;
  votingBeginHour?: Maybe<Scalars['Int']>;
  votingEndDay?: Maybe<Scalars['Int']>;
  votingEndHour?: Maybe<Scalars['Int']>;
  timeZoneRegion?: Maybe<Scalars['String']>;
  timeZone?: Maybe<Scalars['Int']>;
}>;

export type UpdateDaoJobConfigMutation = { __typename?: 'Mutations' } & {
  updateDaoJobConfig?: Maybe<
    { __typename?: 'UpdateDAOJobConfig' } & Pick<UpdateDaoJobConfig, 'ok'>
  >;
};

export type FollowDaoMutationVariables = Exact<{
  daoId: Scalars['String'];
  followType: DaoFollowTypeEnum;
}>;

export type FollowDaoMutation = { __typename?: 'Mutations' } & {
  updateDaoFollow?: Maybe<{ __typename?: 'UpdateDAOFollow' } & Pick<UpdateDaoFollow, 'ok'>>;
};

export type UpdateDaoBaseInfoMutationVariables = Exact<{
  id: Scalars['String'];
  desc?: Maybe<Scalars['String']>;
  logo?: Maybe<Scalars['String']>;
}>;

export type UpdateDaoBaseInfoMutation = { __typename?: 'Mutations' } & {
  updateDaoBaseInfo?: Maybe<
    { __typename?: 'UpdateDAOBaseInfo' } & {
      dao?: Maybe<{ __typename?: 'DAOSchema' } & Pick<DaoSchema, 'updateAt'>>;
    }
  >;
};

export type CreateJobMutationVariables = Exact<{
  issueLink: Scalars['String'];
  size: Scalars['Float'];
}>;

export type CreateJobMutation = { __typename?: 'Mutations' } & {
  createJob?: Maybe<
    { __typename?: 'CreateJob' } & {
      job?: Maybe<
        { __typename?: 'Job' } & {
          node?: Maybe<
            { __typename?: 'JobSchema' } & Pick<JobSchema, 'id' | 'daoId' | 'githubRepoOwner'>
          >;
        }
      >;
    }
  >;
};

export type UpdateJobSizeMutationVariables = Exact<{
  id: Scalars['String'];
  size: Scalars['Float'];
}>;

export type UpdateJobSizeMutation = { __typename?: 'Mutations' } & {
  updateJob?: Maybe<
    { __typename?: 'UpdateJob' } & {
      job?: Maybe<
        { __typename?: 'Job' } & {
          node?: Maybe<{ __typename?: 'JobSchema' } & Pick<JobSchema, 'id'>>;
        }
      >;
    }
  >;
};

export type DeleteJobMutationVariables = Exact<{
  id: Scalars['String'];
}>;

export type DeleteJobMutation = { __typename?: 'Mutations' } & {
  deleteJob?: Maybe<{ __typename?: 'DeleteJob' } & Pick<DeleteJob, 'ok'>>;
};

export type UpdateCycleJobVoteTypeByOwnerMutationVariables = Exact<{
  jobId: Scalars['String'];
  voteType?: Maybe<UpdateJobVoteTypeByOwnerArgumentPairTypeEnum>;
}>;

export type UpdateCycleJobVoteTypeByOwnerMutation = { __typename?: 'Mutations' } & {
  updateJobVoteTypeByOwner?: Maybe<
    { __typename?: 'UpdateJobVoteTypeByOwner' } & Pick<UpdateJobVoteTypeByOwner, 'ok'>
  >;
};

export type AddJobPrMutationVariables = Exact<{
  id: Scalars['String'];
  addPr: Scalars['String'];
}>;

export type AddJobPrMutation = { __typename?: 'Mutations' } & {
  updateJob?: Maybe<
    { __typename?: 'UpdateJob' } & {
      job?: Maybe<
        { __typename?: 'Job' } & {
          node?: Maybe<{ __typename?: 'JobSchema' } & Pick<JobSchema, 'id'>>;
          prs?: Maybe<
            Array<
              Maybe<
                { __typename?: 'JobPRSchema' } & Pick<
                  JobPrSchema,
                  'id' | 'title' | 'githubRepoOwner' | 'githubRepoName' | 'githubPrNumber'
                >
              >
            >
          >;
        }
      >;
    }
  >;
};

export type DeleteJobPrMutationVariables = Exact<{
  id: Scalars['String'];
  deletePr: Scalars['String'];
}>;

export type DeleteJobPrMutation = { __typename?: 'Mutations' } & {
  updateJob?: Maybe<
    { __typename?: 'UpdateJob' } & {
      job?: Maybe<
        { __typename?: 'Job' } & {
          node?: Maybe<{ __typename?: 'JobSchema' } & Pick<JobSchema, 'id'>>;
          prs?: Maybe<
            Array<
              Maybe<
                { __typename?: 'JobPRSchema' } & Pick<
                  JobPrSchema,
                  'id' | 'title' | 'githubRepoOwner' | 'githubRepoName' | 'githubPrNumber'
                >
              >
            >
          >;
        }
      >;
    }
  >;
};

export type UpdateAllVoteMutationVariables = Exact<{
  voteId: Scalars['String'];
  vote: Scalars['Boolean'];
}>;

export type UpdateAllVoteMutation = { __typename?: 'Mutations' } & {
  updateAllVote?: Maybe<{ __typename?: 'UpdateALLVote' } & Pick<UpdateAllVote, 'ok'>>;
};

export type UpdatePairVoteMutationVariables = Exact<{
  voteId: Scalars['String'];
  voteJobId: Scalars['String'];
}>;

export type UpdatePairVoteMutation = { __typename?: 'Mutations' } & {
  updatePairVote?: Maybe<{ __typename?: 'UpdatePairVote' } & Pick<UpdatePairVote, 'ok'>>;
};

export type UpdateOwnerEiMutationVariables = Exact<{
  statId: Scalars['String'];
  ownerEi: Scalars['Decimal'];
}>;

export type UpdateOwnerEiMutation = { __typename?: 'Mutations' } & {
  updateIcpperStatOwnerEi?: Maybe<
    { __typename?: 'UpdateIcpperStatOwnerEi' } & Pick<
      UpdateIcpperStatOwnerEi,
      'ei' | 'ownerEi' | 'voteEi'
    >
  >;
};

export type BeginCyclePairTaskMutationVariables = Exact<{
  cycleId: Scalars['String'];
}>;

export type BeginCyclePairTaskMutation = { __typename?: 'Mutations' } & {
  createCycleVotePairTaskByOwner?: Maybe<
    { __typename?: 'CreateCycleVotePairTaskByOwner' } & Pick<
      CreateCycleVotePairTaskByOwner,
      'status'
    >
  >;
};

export type BeginCycleVoteResultTaskMutationVariables = Exact<{
  cycleId: Scalars['String'];
}>;

export type BeginCycleVoteResultTaskMutation = { __typename?: 'Mutations' } & {
  createCycleVoteResultStatTaskByOwner?: Maybe<
    { __typename?: 'CreateCycleVoteResultStatTaskByOwner' } & Pick<
      CreateCycleVoteResultStatTaskByOwner,
      'status'
    >
  >;
};

export type BeginPublishCycleTaskMutationVariables = Exact<{
  cycleId: Scalars['String'];
}>;

export type BeginPublishCycleTaskMutation = { __typename?: 'Mutations' } & {
  createCycleVoteResultPublishTaskByOwner?: Maybe<
    { __typename?: 'CreateCycleVoteResultPublishTaskByOwner' } & Pick<
      CreateCycleVoteResultPublishTaskByOwner,
      'status'
    >
  >;
};

export type UpdateVotePairPublicMutationVariables = Exact<{
  voteId: Scalars['String'];
  isPublic: Scalars['Boolean'];
}>;

export type UpdateVotePairPublicMutation = { __typename?: 'Mutations' } & {
  changeVoteResultPublic?: Maybe<
    { __typename?: 'ChangeVoteResultPublic' } & Pick<ChangeVoteResultPublic, 'ok'>
  >;
};

export type MarkCyclesTokenReleasedMutationVariables = Exact<{
  daoId: Scalars['String'];
  cycleIds: Array<Maybe<Scalars['String']>> | Maybe<Scalars['String']>;
  unitSizeValue: Scalars['String'];
}>;

export type MarkCyclesTokenReleasedMutation = { __typename?: 'Mutations' } & {
  markCyclesTokenReleased?: Maybe<
    { __typename?: 'MarkCyclesTokenReleased' } & Pick<MarkCyclesTokenReleased, 'ok'>
  >;
};

export type DaoQueryVariables = Exact<{
  id: Scalars['String'];
}>;

export type DaoQuery = { __typename?: 'Query' } & {
  dao?: Maybe<
    { __typename?: 'DAO' } & {
      datum?: Maybe<
        { __typename?: 'DAOSchema' } & Pick<
          DaoSchema,
          'id' | 'number' | 'name' | 'desc' | 'logo' | 'ownerId' | 'createAt' | 'updateAt'
        >
      >;
      following?: Maybe<{ __typename?: 'DAOFollowUDSchema' } & Pick<DaoFollowUdSchema, 'total'>>;
    }
  >;
};

export type DaoJobConfigQueryVariables = Exact<{
  daoId: Scalars['String'];
}>;

export type DaoJobConfigQuery = { __typename?: 'Query' } & {
  daoJobConfig?: Maybe<
    { __typename?: 'DAOJobConfig' } & {
      datum?: Maybe<
        { __typename?: 'DAOJobConfigSchema' } & Pick<
          DaoJobConfigSchema,
          | 'id'
          | 'daoId'
          | 'createAt'
          | 'deadlineDay'
          | 'deadlineTime'
          | 'pairBeginDay'
          | 'pairBeginHour'
          | 'pairEndDay'
          | 'pairEndHour'
          | 'timeZone'
          | 'timeZoneRegion'
          | 'updateAt'
          | 'votingBeginDay'
          | 'votingBeginHour'
          | 'votingEndDay'
          | 'votingEndHour'
        >
      >;
      existedLastCycle?: Maybe<
        { __typename?: 'DAOJobCycle' } & Pick<
          DaoJobCycle,
          | 'timeZone'
          | 'beginAt'
          | 'endAt'
          | 'pairBeginAt'
          | 'pairEndAt'
          | 'voteBeginAt'
          | 'voteEndAt'
        >
      >;
      getNextCycle?: Maybe<
        { __typename?: 'DAOJobCycle' } & Pick<
          DaoJobCycle,
          | 'timeZone'
          | 'beginAt'
          | 'endAt'
          | 'pairBeginAt'
          | 'pairEndAt'
          | 'voteBeginAt'
          | 'voteEndAt'
        >
      >;
    }
  >;
};

export type DaoJobConfigPreviewNextCycleQueryVariables = Exact<{
  daoId: Scalars['String'];
  timeZone?: Maybe<Scalars['Int']>;
  deadlineDay?: Maybe<Scalars['Int']>;
  deadlineTime?: Maybe<Scalars['Int']>;
  pairBeginDay?: Maybe<Scalars['Int']>;
  pairBeginHour?: Maybe<Scalars['Int']>;
  pairEndDay?: Maybe<Scalars['Int']>;
  pairEndHour?: Maybe<Scalars['Int']>;
  votingBeginDay?: Maybe<Scalars['Int']>;
  votingBeginHour?: Maybe<Scalars['Int']>;
  votingEndDay?: Maybe<Scalars['Int']>;
  votingEndHour?: Maybe<Scalars['Int']>;
}>;

export type DaoJobConfigPreviewNextCycleQuery = { __typename?: 'Query' } & {
  daoJobConfig?: Maybe<
    { __typename?: 'DAOJobConfig' } & {
      previewNextCycle?: Maybe<
        { __typename?: 'DAOJobCycle' } & Pick<
          DaoJobCycle,
          | 'timeZone'
          | 'beginAt'
          | 'endAt'
          | 'pairBeginAt'
          | 'pairEndAt'
          | 'voteBeginAt'
          | 'voteEndAt'
        >
      >;
    }
  >;
};

export type DaoTokenConfigQueryVariables = Exact<{
  daoId: Scalars['String'];
}>;

export type DaoTokenConfigQuery = { __typename?: 'Query' } & {
  daoTokenConfig?: Maybe<{ __typename?: 'DAOTokenConfig' } & Pick<DaoTokenConfig, 'ethDaoId'>>;
};

export type DaoFollowInfoQueryVariables = Exact<{
  id: Scalars['String'];
  userId: Scalars['String'];
}>;

export type DaoFollowInfoQuery = { __typename?: 'Query' } & {
  dao?: Maybe<
    { __typename?: 'DAO' } & {
      datum?: Maybe<
        { __typename?: 'DAOSchema' } & Pick<
          DaoSchema,
          'id' | 'number' | 'name' | 'desc' | 'logo' | 'ownerId' | 'createAt' | 'updateAt'
        >
      >;
      following?: Maybe<
        { __typename?: 'DAOFollowUDSchema' } & Pick<DaoFollowUdSchema, 'total'> & {
            followers?: Maybe<
              Array<Maybe<{ __typename?: 'DAOFollowSchema' } & Pick<DaoFollowSchema, 'createAt'>>>
            >;
          }
      >;
    }
  >;
};

export type DaoListQueryVariables = Exact<{
  filter?: Maybe<DaOsFilterEnum>;
  sorted?: Maybe<DaOsSortedEnum>;
  sortedType?: Maybe<DaOsSortedTypeEnum>;
  search?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type DaoListQuery = { __typename?: 'Query' } & {
  daos?: Maybe<
    { __typename?: 'DAOs' } & Pick<DaOs, 'total'> & {
        dao?: Maybe<
          Array<
            Maybe<
              { __typename?: 'DAOItem' } & Pick<DaoItem, 'isFollowing' | 'isOwner'> & {
                  datum?: Maybe<
                    { __typename?: 'DAOSchema' } & Pick<
                      DaoSchema,
                      'createAt' | 'desc' | 'id' | 'logo' | 'name' | 'ownerId' | 'updateAt'
                    >
                  >;
                  stat?: Maybe<
                    { __typename?: 'DAOStat' } & Pick<
                      DaoStat,
                      'following' | 'job' | 'size' | 'token'
                    >
                  >;
                }
            >
          >
        >;
        stat?: Maybe<{ __typename?: 'DAOsStat' } & Pick<DaOsStat, 'icpper' | 'size' | 'income'>>;
      }
  >;
};

export type UserJobDaoListQueryVariables = Exact<{
  userName?: Maybe<Scalars['String']>;
}>;

export type UserJobDaoListQuery = { __typename?: 'Query' } & {
  daos?: Maybe<
    { __typename?: 'DAOs' } & {
      dao?: Maybe<
        Array<
          Maybe<
            { __typename?: 'DAOItem' } & {
              datum?: Maybe<{ __typename?: 'DAOSchema' } & Pick<DaoSchema, 'id' | 'name'>>;
            }
          >
        >
      >;
    }
  >;
};

export type DaoGithubAppStatusQueryVariables = Exact<{
  name: Scalars['String'];
}>;

export type DaoGithubAppStatusQuery = { __typename?: 'Query' } & {
  daoGithubAppStatus?: Maybe<
    { __typename?: 'DAOGithubAppStatus' } & Pick<
      DaoGithubAppStatus,
      'githubAppName' | 'githubOrgId' | 'isExists' | 'isGithubOrgOwner' | 'isIcpAppInstalled'
    >
  >;
};

export type JobListQueryVariables = Exact<{
  beginTime?: Maybe<Scalars['Int']>;
  endTime?: Maybe<Scalars['Int']>;
  daoName: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sorted?: Maybe<JobSortedEnum>;
  sortedType?: Maybe<SortedTypeEnum>;
  userName?: Maybe<Scalars['String']>;
}>;

export type JobListQuery = { __typename?: 'Query' } & {
  jobs?: Maybe<
    { __typename?: 'Jobs' } & Pick<Jobs, 'total'> & {
        job?: Maybe<
          Array<
            Maybe<
              { __typename?: 'Job' } & {
                node?: Maybe<
                  { __typename?: 'JobSchema' } & Pick<
                    JobSchema,
                    | 'id'
                    | 'title'
                    | 'size'
                    | 'status'
                    | 'githubRepoOwner'
                    | 'githubRepoName'
                    | 'githubIssueNumber'
                    | 'income'
                  >
                >;
                prs?: Maybe<
                  Array<
                    Maybe<
                      { __typename?: 'JobPRSchema' } & Pick<
                        JobPrSchema,
                        'id' | 'title' | 'githubRepoOwner' | 'githubRepoName' | 'githubPrNumber'
                      >
                    >
                  >
                >;
              }
            >
          >
        >;
        stat?: Maybe<
          { __typename?: 'JobsStat' } & Pick<JobsStat, 'size' | 'tokenCount' | 'tokenName'>
        >;
      }
  >;
};

export type CycleJobListQueryVariables = Exact<{
  cycleId: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  pairType?: Maybe<JobsQueryPairTypeEnum>;
  sorted?: Maybe<JobsQuerySortedEnum>;
  sortedType?: Maybe<JobsQuerySortedTypeEnum>;
}>;

export type CycleJobListQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      jobs?: Maybe<
        { __typename?: 'JobsQuery' } & Pick<JobsQuery, 'total'> & {
            nodes?: Maybe<
              Array<
                Maybe<
                  { __typename?: 'JobQuery' } & {
                    datum?: Maybe<
                      { __typename?: 'JobSchema' } & Pick<
                        JobSchema,
                        | 'id'
                        | 'githubRepoOwner'
                        | 'githubRepoName'
                        | 'githubIssueNumber'
                        | 'title'
                        | 'size'
                        | 'income'
                        | 'pairType'
                      >
                    >;
                    user?: Maybe<
                      { __typename?: 'UserSchema' } & Pick<
                        UserSchema,
                        'id' | 'avatar' | 'nickname' | 'githubLogin'
                      >
                    >;
                  }
                >
              >
            >;
          }
      >;
    }
  >;
};

export type CycleIcpperListQueryVariables = Exact<{
  cycleId: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sorted?: Maybe<CycleIcpperStatSortedEnum>;
  sortedType?: Maybe<CycleIcpperStatSortedTypeEnum>;
}>;

export type CycleIcpperListQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      icpperStats?: Maybe<
        { __typename?: 'IcpperStatsQuery' } & Pick<IcpperStatsQuery, 'total'> & {
            nodes?: Maybe<
              Array<
                Maybe<
                  { __typename?: 'IcpperStatQuery' } & Pick<IcpperStatQuery, 'lastEi'> & {
                      datum?: Maybe<
                        { __typename?: 'CycleIcpperStatSchema' } & Pick<
                          CycleIcpperStatSchema,
                          | 'id'
                          | 'jobCount'
                          | 'size'
                          | 'income'
                          | 'ei'
                          | 'beDeductedSizeByReview'
                          | 'haveTwoTimesLt04'
                          | 'haveTwoTimesLt08'
                          | 'unVotedAllVote'
                        >
                      >;
                      icpper?: Maybe<
                        { __typename?: 'UserSchema' } & Pick<
                          UserSchema,
                          'id' | 'avatar' | 'nickname' | 'githubLogin'
                        >
                      >;
                      beReviewerHasWarningUsers?: Maybe<
                        Array<
                          Maybe<{ __typename?: 'UserSchema' } & Pick<UserSchema, 'id' | 'nickname'>>
                        >
                      >;
                    }
                >
              >
            >;
          }
      >;
    }
  >;
};

export type OwnerCycleIcpperListQueryVariables = Exact<{
  cycleId: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  sorted?: Maybe<CycleIcpperStatSortedEnum>;
  sortedType?: Maybe<CycleIcpperStatSortedTypeEnum>;
}>;

export type OwnerCycleIcpperListQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      icpperStats?: Maybe<
        { __typename?: 'IcpperStatsQuery' } & Pick<IcpperStatsQuery, 'total'> & {
            nodes?: Maybe<
              Array<
                Maybe<
                  { __typename?: 'IcpperStatQuery' } & Pick<IcpperStatQuery, 'lastEi'> & {
                      datum?: Maybe<
                        { __typename?: 'CycleIcpperStatSchema' } & Pick<
                          CycleIcpperStatSchema,
                          | 'id'
                          | 'jobCount'
                          | 'size'
                          | 'income'
                          | 'ei'
                          | 'ownerEi'
                          | 'voteEi'
                          | 'beDeductedSizeByReview'
                          | 'haveTwoTimesLt04'
                          | 'haveTwoTimesLt08'
                          | 'unVotedAllVote'
                        >
                      >;
                      icpper?: Maybe<
                        { __typename?: 'UserSchema' } & Pick<
                          UserSchema,
                          'id' | 'avatar' | 'nickname' | 'githubLogin'
                        >
                      >;
                      beReviewerHasWarningUsers?: Maybe<
                        Array<
                          Maybe<{ __typename?: 'UserSchema' } & Pick<UserSchema, 'id' | 'nickname'>>
                        >
                      >;
                    }
                >
              >
            >;
          }
      >;
    }
  >;
};

export type CycleVoteListQueryVariables = Exact<{
  cycleId: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  isMyself?: Maybe<Scalars['Boolean']>;
  isPublic?: Maybe<Scalars['Boolean']>;
}>;

export type CycleVoteListQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      datum?: Maybe<
        { __typename?: 'CycleSchema' } & Pick<
          CycleSchema,
          'beginAt' | 'endAt' | 'voteBeginAt' | 'voteEndAt'
        >
      >;
      votes?: Maybe<
        { __typename?: 'CycleVotesQuery' } & Pick<CycleVotesQuery, 'total'> & {
            nodes?: Maybe<
              Array<
                Maybe<
                  { __typename?: 'CycleVoteQuery' } & {
                    datum?: Maybe<
                      { __typename?: 'CycleVoteSchema' } & Pick<
                        CycleVoteSchema,
                        | 'id'
                        | 'isResultPublic'
                        | 'voteJobId'
                        | 'voteResultStatTypeAll'
                        | 'voteType'
                        | 'voterId'
                      >
                    >;
                    leftJob?: Maybe<
                      { __typename?: 'JobItemQuery' } & {
                        datum?: Maybe<
                          { __typename?: 'JobSchema' } & Pick<
                            JobSchema,
                            | 'title'
                            | 'githubRepoOwner'
                            | 'githubRepoName'
                            | 'githubIssueNumber'
                            | 'size'
                            | 'pairType'
                            | 'id'
                          >
                        >;
                        user?: Maybe<
                          { __typename?: 'UserSchema' } & Pick<
                            UserSchema,
                            'id' | 'githubLogin' | 'nickname'
                          >
                        >;
                      }
                    >;
                    rightJob?: Maybe<
                      { __typename?: 'JobItemQuery' } & {
                        datum?: Maybe<
                          { __typename?: 'JobSchema' } & Pick<
                            JobSchema,
                            | 'title'
                            | 'githubRepoOwner'
                            | 'githubRepoName'
                            | 'githubIssueNumber'
                            | 'pairType'
                            | 'size'
                            | 'id'
                          >
                        >;
                        user?: Maybe<
                          { __typename?: 'UserSchema' } & Pick<
                            UserSchema,
                            'id' | 'githubLogin' | 'nickname'
                          >
                        >;
                      }
                    >;
                    voteJob?: Maybe<
                      { __typename?: 'JobItemQuery' } & {
                        datum?: Maybe<{ __typename?: 'JobSchema' } & Pick<JobSchema, 'id'>>;
                      }
                    >;
                    voter?: Maybe<
                      { __typename?: 'UserSchema' } & Pick<
                        UserSchema,
                        'id' | 'githubLogin' | 'nickname'
                      >
                    >;
                  }
                >
              >
            >;
          }
      >;
    }
  >;
};

export type DaoCycleQueryVariables = Exact<{
  daoId: Scalars['String'];
}>;

export type DaoCycleQuery = { __typename?: 'Query' } & {
  dao?: Maybe<
    { __typename?: 'DAO' } & {
      cycles?: Maybe<
        { __typename?: 'CyclesQuery' } & {
          nodes?: Maybe<
            Array<
              Maybe<
                { __typename?: 'CycleQuery' } & {
                  datum?: Maybe<
                    { __typename?: 'CycleSchema' } & Pick<
                      CycleSchema,
                      | 'id'
                      | 'timeZone'
                      | 'beginAt'
                      | 'endAt'
                      | 'pairBeginAt'
                      | 'pairEndAt'
                      | 'voteBeginAt'
                      | 'voteEndAt'
                      | 'pairedAt'
                      | 'voteResultPublishedAt'
                      | 'voteResultStatAt'
                    >
                  >;
                }
              >
            >
          >;
        }
      >;
    }
  >;
};

export type CycleStatDataQueryVariables = Exact<{
  cycleId: Scalars['String'];
}>;

export type CycleStatDataQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      stat?: Maybe<
        { __typename?: 'CycleStatQuery' } & Pick<
          CycleStatQuery,
          'icpperCount' | 'jobCount' | 'size'
        >
      >;
    }
  >;
};

export type CyclePairStatusQueryVariables = Exact<{
  cycleId: Scalars['String'];
}>;

export type CyclePairStatusQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      pairTask?: Maybe<
        { __typename?: 'CycleVotePairTaskQuery' } & Pick<CycleVotePairTaskQuery, 'status'>
      >;
    }
  >;
};

export type CycleVoteResultStatusQueryVariables = Exact<{
  cycleId: Scalars['String'];
}>;

export type CycleVoteResultStatusQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      voteResultStatTask?: Maybe<
        { __typename?: 'CycleVoteResultStatTaskQuery' } & Pick<
          CycleVoteResultStatTaskQuery,
          'status'
        >
      >;
    }
  >;
};

export type CyclePublishStatusQueryVariables = Exact<{
  cycleId: Scalars['String'];
}>;

export type CyclePublishStatusQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      voteResultPublishTask?: Maybe<
        { __typename?: 'CycleVoteResultPublishTaskQuery' } & Pick<
          CycleVoteResultPublishTaskQuery,
          'status'
        >
      >;
    }
  >;
};

export type DaoVotingCycleQueryVariables = Exact<{
  daoId: Scalars['String'];
}>;

export type DaoVotingCycleQuery = { __typename?: 'Query' } & {
  dao?: Maybe<
    { __typename?: 'DAO' } & {
      cycles?: Maybe<
        { __typename?: 'CyclesQuery' } & {
          nodes?: Maybe<
            Array<
              Maybe<
                { __typename?: 'CycleQuery' } & {
                  datum?: Maybe<
                    { __typename?: 'CycleSchema' } & Pick<
                      CycleSchema,
                      'id' | 'beginAt' | 'endAt' | 'voteBeginAt' | 'voteEndAt'
                    >
                  >;
                }
              >
            >
          >;
        }
      >;
    }
  >;
};

export type DaoProcessingCycleQueryVariables = Exact<{
  daoId: Scalars['String'];
}>;

export type DaoProcessingCycleQuery = { __typename?: 'Query' } & {
  dao?: Maybe<
    { __typename?: 'DAO' } & {
      cycles?: Maybe<
        { __typename?: 'CyclesQuery' } & {
          nodes?: Maybe<
            Array<
              Maybe<
                { __typename?: 'CycleQuery' } & {
                  datum?: Maybe<
                    { __typename?: 'CycleSchema' } & Pick<CycleSchema, 'id' | 'beginAt' | 'endAt'>
                  >;
                }
              >
            >
          >;
        }
      >;
    }
  >;
};

export type DaoCycleVoteListQueryVariables = Exact<{
  cycleId: Scalars['String'];
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
}>;

export type DaoCycleVoteListQuery = { __typename?: 'Query' } & {
  cycle?: Maybe<
    { __typename?: 'CycleQuery' } & {
      datum?: Maybe<
        { __typename?: 'CycleSchema' } & Pick<
          CycleSchema,
          'beginAt' | 'endAt' | 'voteBeginAt' | 'voteEndAt'
        >
      >;
      votes?: Maybe<
        { __typename?: 'CycleVotesQuery' } & Pick<CycleVotesQuery, 'total'> & {
            nodes?: Maybe<
              Array<
                Maybe<
                  { __typename?: 'CycleVoteQuery' } & Pick<
                    CycleVoteQuery,
                    'selfVoteResultTypeAll'
                  > & {
                      datum?: Maybe<
                        { __typename?: 'CycleVoteSchema' } & Pick<
                          CycleVoteSchema,
                          | 'id'
                          | 'isResultPublic'
                          | 'voteJobId'
                          | 'voteResultStatTypeAll'
                          | 'voteType'
                          | 'voterId'
                        >
                      >;
                      leftJob?: Maybe<
                        { __typename?: 'JobItemQuery' } & {
                          datum?: Maybe<
                            { __typename?: 'JobSchema' } & Pick<
                              JobSchema,
                              | 'title'
                              | 'githubRepoOwner'
                              | 'githubRepoName'
                              | 'githubIssueNumber'
                              | 'size'
                              | 'pairType'
                              | 'id'
                            >
                          >;
                          user?: Maybe<
                            { __typename?: 'UserSchema' } & Pick<
                              UserSchema,
                              'id' | 'githubLogin' | 'nickname'
                            >
                          >;
                        }
                      >;
                      rightJob?: Maybe<
                        { __typename?: 'JobItemQuery' } & {
                          datum?: Maybe<
                            { __typename?: 'JobSchema' } & Pick<
                              JobSchema,
                              | 'title'
                              | 'githubRepoOwner'
                              | 'githubRepoName'
                              | 'githubIssueNumber'
                              | 'pairType'
                              | 'size'
                              | 'id'
                            >
                          >;
                          user?: Maybe<
                            { __typename?: 'UserSchema' } & Pick<
                              UserSchema,
                              'id' | 'githubLogin' | 'nickname'
                            >
                          >;
                        }
                      >;
                      voteJob?: Maybe<
                        { __typename?: 'JobItemQuery' } & {
                          datum?: Maybe<{ __typename?: 'JobSchema' } & Pick<JobSchema, 'id'>>;
                        }
                      >;
                      voter?: Maybe<
                        { __typename?: 'UserSchema' } & Pick<
                          UserSchema,
                          'id' | 'githubLogin' | 'nickname'
                        >
                      >;
                    }
                >
              >
            >;
          }
      >;
    }
  >;
};

export type CyclesByTokenUnreleasedListQueryVariables = Exact<{
  lastTimestamp: Scalars['Int'];
}>;

export type CyclesByTokenUnreleasedListQuery = { __typename?: 'Query' } & {
  cyclesByTokenUnreleased?: Maybe<
    { __typename?: 'CycleByTokenUnreleasedQuery' } & {
      nodes?: Maybe<
        Array<
          Maybe<
            { __typename?: 'CycleQuery' } & {
              datum?: Maybe<
                { __typename?: 'CycleSchema' } & Pick<
                  CycleSchema,
                  'id' | 'daoId' | 'timeZone' | 'beginAt' | 'endAt' | 'voteResultPublishedAt'
                >
              >;
              icpperStats?: Maybe<
                { __typename?: 'IcpperStatsQuery' } & {
                  nodes?: Maybe<
                    Array<
                      Maybe<
                        { __typename?: 'IcpperStatQuery' } & {
                          datum?: Maybe<
                            { __typename?: 'CycleIcpperStatSchema' } & Pick<
                              CycleIcpperStatSchema,
                              'cycleId' | 'jobSize' | 'size'
                            >
                          >;
                          icpper?: Maybe<
                            { __typename?: 'UserSchema' } & Pick<
                              UserSchema,
                              'id' | 'githubLogin' | 'nickname' | 'erc20Address'
                            >
                          >;
                        }
                      >
                    >
                  >;
                }
              >;
            }
          >
        >
      >;
    }
  >;
};

export const CreateDaoDocument = gql`
  mutation CreateDAO(
    $name: String!
    $desc: String!
    $logo: String!
    $timeZone: Int!
    $timeZoneRegion: String!
  ) {
    createDao(
      name: $name
      desc: $desc
      logo: $logo
      timeZone: $timeZone
      timeZoneRegion: $timeZoneRegion
    ) {
      dao {
        id
        number
        createAt
      }
    }
  }
`;
export type CreateDaoMutationFn = Apollo.MutationFunction<
  CreateDaoMutation,
  CreateDaoMutationVariables
>;

/**
 * __useCreateDaoMutation__
 *
 * To run a mutation, you first call `useCreateDaoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateDaoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createDaoMutation, { data, loading, error }] = useCreateDaoMutation({
 *   variables: {
 *      name: // value for 'name'
 *      desc: // value for 'desc'
 *      logo: // value for 'logo'
 *      timeZone: // value for 'timeZone'
 *      timeZoneRegion: // value for 'timeZoneRegion'
 *   },
 * });
 */
export function useCreateDaoMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateDaoMutation, CreateDaoMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateDaoMutation, CreateDaoMutationVariables>(
    CreateDaoDocument,
    options,
  );
}
export type CreateDaoMutationHookResult = ReturnType<typeof useCreateDaoMutation>;
export type CreateDaoMutationResult = Apollo.MutationResult<CreateDaoMutation>;
export type CreateDaoMutationOptions = Apollo.BaseMutationOptions<
  CreateDaoMutation,
  CreateDaoMutationVariables
>;
export const UpdateDaoJobConfigDocument = gql`
  mutation UpdateDAOJobConfig(
    $daoId: String!
    $deadlineDay: Int
    $deadlineTime: Int
    $pairBeginDay: Int
    $pairBeginHour: Int
    $pairEndDay: Int
    $pairEndHour: Int
    $votingBeginDay: Int
    $votingBeginHour: Int
    $votingEndDay: Int
    $votingEndHour: Int
    $timeZoneRegion: String
    $timeZone: Int
  ) {
    updateDaoJobConfig(
      daoId: $daoId
      deadlineDay: $deadlineDay
      deadlineTime: $deadlineTime
      pairBeginDay: $pairBeginDay
      pairBeginHour: $pairBeginHour
      pairEndDay: $pairEndDay
      pairEndHour: $pairEndHour
      votingBeginDay: $votingBeginDay
      votingBeginHour: $votingBeginHour
      votingEndDay: $votingEndDay
      votingEndHour: $votingEndHour
      timeZone: $timeZone
      timeZoneRegion: $timeZoneRegion
    ) {
      ok
    }
  }
`;
export type UpdateDaoJobConfigMutationFn = Apollo.MutationFunction<
  UpdateDaoJobConfigMutation,
  UpdateDaoJobConfigMutationVariables
>;

/**
 * __useUpdateDaoJobConfigMutation__
 *
 * To run a mutation, you first call `useUpdateDaoJobConfigMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDaoJobConfigMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDaoJobConfigMutation, { data, loading, error }] = useUpdateDaoJobConfigMutation({
 *   variables: {
 *      daoId: // value for 'daoId'
 *      deadlineDay: // value for 'deadlineDay'
 *      deadlineTime: // value for 'deadlineTime'
 *      pairBeginDay: // value for 'pairBeginDay'
 *      pairBeginHour: // value for 'pairBeginHour'
 *      pairEndDay: // value for 'pairEndDay'
 *      pairEndHour: // value for 'pairEndHour'
 *      votingBeginDay: // value for 'votingBeginDay'
 *      votingBeginHour: // value for 'votingBeginHour'
 *      votingEndDay: // value for 'votingEndDay'
 *      votingEndHour: // value for 'votingEndHour'
 *      timeZoneRegion: // value for 'timeZoneRegion'
 *      timeZone: // value for 'timeZone'
 *   },
 * });
 */
export function useUpdateDaoJobConfigMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateDaoJobConfigMutation,
    UpdateDaoJobConfigMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateDaoJobConfigMutation, UpdateDaoJobConfigMutationVariables>(
    UpdateDaoJobConfigDocument,
    options,
  );
}
export type UpdateDaoJobConfigMutationHookResult = ReturnType<typeof useUpdateDaoJobConfigMutation>;
export type UpdateDaoJobConfigMutationResult = Apollo.MutationResult<UpdateDaoJobConfigMutation>;
export type UpdateDaoJobConfigMutationOptions = Apollo.BaseMutationOptions<
  UpdateDaoJobConfigMutation,
  UpdateDaoJobConfigMutationVariables
>;
export const FollowDaoDocument = gql`
  mutation FollowDAO($daoId: String!, $followType: DAOFollowTypeEnum!) {
    updateDaoFollow(daoId: $daoId, type: $followType) {
      ok
    }
  }
`;
export type FollowDaoMutationFn = Apollo.MutationFunction<
  FollowDaoMutation,
  FollowDaoMutationVariables
>;

/**
 * __useFollowDaoMutation__
 *
 * To run a mutation, you first call `useFollowDaoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useFollowDaoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [followDaoMutation, { data, loading, error }] = useFollowDaoMutation({
 *   variables: {
 *      daoId: // value for 'daoId'
 *      followType: // value for 'followType'
 *   },
 * });
 */
export function useFollowDaoMutation(
  baseOptions?: Apollo.MutationHookOptions<FollowDaoMutation, FollowDaoMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<FollowDaoMutation, FollowDaoMutationVariables>(
    FollowDaoDocument,
    options,
  );
}
export type FollowDaoMutationHookResult = ReturnType<typeof useFollowDaoMutation>;
export type FollowDaoMutationResult = Apollo.MutationResult<FollowDaoMutation>;
export type FollowDaoMutationOptions = Apollo.BaseMutationOptions<
  FollowDaoMutation,
  FollowDaoMutationVariables
>;
export const UpdateDaoBaseInfoDocument = gql`
  mutation UpdateDAOBaseInfo($id: String!, $desc: String, $logo: String) {
    updateDaoBaseInfo(id: $id, desc: $desc, logo: $logo) {
      dao {
        updateAt
      }
    }
  }
`;
export type UpdateDaoBaseInfoMutationFn = Apollo.MutationFunction<
  UpdateDaoBaseInfoMutation,
  UpdateDaoBaseInfoMutationVariables
>;

/**
 * __useUpdateDaoBaseInfoMutation__
 *
 * To run a mutation, you first call `useUpdateDaoBaseInfoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDaoBaseInfoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDaoBaseInfoMutation, { data, loading, error }] = useUpdateDaoBaseInfoMutation({
 *   variables: {
 *      id: // value for 'id'
 *      desc: // value for 'desc'
 *      logo: // value for 'logo'
 *   },
 * });
 */
export function useUpdateDaoBaseInfoMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateDaoBaseInfoMutation,
    UpdateDaoBaseInfoMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateDaoBaseInfoMutation, UpdateDaoBaseInfoMutationVariables>(
    UpdateDaoBaseInfoDocument,
    options,
  );
}
export type UpdateDaoBaseInfoMutationHookResult = ReturnType<typeof useUpdateDaoBaseInfoMutation>;
export type UpdateDaoBaseInfoMutationResult = Apollo.MutationResult<UpdateDaoBaseInfoMutation>;
export type UpdateDaoBaseInfoMutationOptions = Apollo.BaseMutationOptions<
  UpdateDaoBaseInfoMutation,
  UpdateDaoBaseInfoMutationVariables
>;
export const CreateJobDocument = gql`
  mutation CreateJob($issueLink: String!, $size: Float!) {
    createJob(issueLink: $issueLink, size: $size) {
      job {
        node {
          id
          daoId
          githubRepoOwner
        }
      }
    }
  }
`;
export type CreateJobMutationFn = Apollo.MutationFunction<
  CreateJobMutation,
  CreateJobMutationVariables
>;

/**
 * __useCreateJobMutation__
 *
 * To run a mutation, you first call `useCreateJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createJobMutation, { data, loading, error }] = useCreateJobMutation({
 *   variables: {
 *      issueLink: // value for 'issueLink'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useCreateJobMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateJobMutation, CreateJobMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateJobMutation, CreateJobMutationVariables>(
    CreateJobDocument,
    options,
  );
}
export type CreateJobMutationHookResult = ReturnType<typeof useCreateJobMutation>;
export type CreateJobMutationResult = Apollo.MutationResult<CreateJobMutation>;
export type CreateJobMutationOptions = Apollo.BaseMutationOptions<
  CreateJobMutation,
  CreateJobMutationVariables
>;
export const UpdateJobSizeDocument = gql`
  mutation UpdateJobSize($id: String!, $size: Float!) {
    updateJob(id: $id, size: $size) {
      job {
        node {
          id
        }
      }
    }
  }
`;
export type UpdateJobSizeMutationFn = Apollo.MutationFunction<
  UpdateJobSizeMutation,
  UpdateJobSizeMutationVariables
>;

/**
 * __useUpdateJobSizeMutation__
 *
 * To run a mutation, you first call `useUpdateJobSizeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateJobSizeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateJobSizeMutation, { data, loading, error }] = useUpdateJobSizeMutation({
 *   variables: {
 *      id: // value for 'id'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useUpdateJobSizeMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateJobSizeMutation, UpdateJobSizeMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateJobSizeMutation, UpdateJobSizeMutationVariables>(
    UpdateJobSizeDocument,
    options,
  );
}
export type UpdateJobSizeMutationHookResult = ReturnType<typeof useUpdateJobSizeMutation>;
export type UpdateJobSizeMutationResult = Apollo.MutationResult<UpdateJobSizeMutation>;
export type UpdateJobSizeMutationOptions = Apollo.BaseMutationOptions<
  UpdateJobSizeMutation,
  UpdateJobSizeMutationVariables
>;
export const DeleteJobDocument = gql`
  mutation DeleteJob($id: String!) {
    deleteJob(id: $id) {
      ok
    }
  }
`;
export type DeleteJobMutationFn = Apollo.MutationFunction<
  DeleteJobMutation,
  DeleteJobMutationVariables
>;

/**
 * __useDeleteJobMutation__
 *
 * To run a mutation, you first call `useDeleteJobMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJobMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJobMutation, { data, loading, error }] = useDeleteJobMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteJobMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteJobMutation, DeleteJobMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteJobMutation, DeleteJobMutationVariables>(
    DeleteJobDocument,
    options,
  );
}
export type DeleteJobMutationHookResult = ReturnType<typeof useDeleteJobMutation>;
export type DeleteJobMutationResult = Apollo.MutationResult<DeleteJobMutation>;
export type DeleteJobMutationOptions = Apollo.BaseMutationOptions<
  DeleteJobMutation,
  DeleteJobMutationVariables
>;
export const UpdateCycleJobVoteTypeByOwnerDocument = gql`
  mutation UpdateCycleJobVoteTypeByOwner(
    $jobId: String!
    $voteType: UpdateJobVoteTypeByOwnerArgumentPairTypeEnum
  ) {
    updateJobVoteTypeByOwner(id: $jobId, voteType: $voteType) {
      ok
    }
  }
`;
export type UpdateCycleJobVoteTypeByOwnerMutationFn = Apollo.MutationFunction<
  UpdateCycleJobVoteTypeByOwnerMutation,
  UpdateCycleJobVoteTypeByOwnerMutationVariables
>;

/**
 * __useUpdateCycleJobVoteTypeByOwnerMutation__
 *
 * To run a mutation, you first call `useUpdateCycleJobVoteTypeByOwnerMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCycleJobVoteTypeByOwnerMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCycleJobVoteTypeByOwnerMutation, { data, loading, error }] = useUpdateCycleJobVoteTypeByOwnerMutation({
 *   variables: {
 *      jobId: // value for 'jobId'
 *      voteType: // value for 'voteType'
 *   },
 * });
 */
export function useUpdateCycleJobVoteTypeByOwnerMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateCycleJobVoteTypeByOwnerMutation,
    UpdateCycleJobVoteTypeByOwnerMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateCycleJobVoteTypeByOwnerMutation,
    UpdateCycleJobVoteTypeByOwnerMutationVariables
  >(UpdateCycleJobVoteTypeByOwnerDocument, options);
}
export type UpdateCycleJobVoteTypeByOwnerMutationHookResult = ReturnType<
  typeof useUpdateCycleJobVoteTypeByOwnerMutation
>;
export type UpdateCycleJobVoteTypeByOwnerMutationResult =
  Apollo.MutationResult<UpdateCycleJobVoteTypeByOwnerMutation>;
export type UpdateCycleJobVoteTypeByOwnerMutationOptions = Apollo.BaseMutationOptions<
  UpdateCycleJobVoteTypeByOwnerMutation,
  UpdateCycleJobVoteTypeByOwnerMutationVariables
>;
export const AddJobPrDocument = gql`
  mutation AddJobPR($id: String!, $addPr: String!) {
    updateJob(id: $id, addPr: $addPr) {
      job {
        node {
          id
        }
        prs {
          id
          title
          githubRepoOwner
          githubRepoName
          githubPrNumber
        }
      }
    }
  }
`;
export type AddJobPrMutationFn = Apollo.MutationFunction<
  AddJobPrMutation,
  AddJobPrMutationVariables
>;

/**
 * __useAddJobPrMutation__
 *
 * To run a mutation, you first call `useAddJobPrMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddJobPrMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addJobPrMutation, { data, loading, error }] = useAddJobPrMutation({
 *   variables: {
 *      id: // value for 'id'
 *      addPr: // value for 'addPr'
 *   },
 * });
 */
export function useAddJobPrMutation(
  baseOptions?: Apollo.MutationHookOptions<AddJobPrMutation, AddJobPrMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddJobPrMutation, AddJobPrMutationVariables>(AddJobPrDocument, options);
}
export type AddJobPrMutationHookResult = ReturnType<typeof useAddJobPrMutation>;
export type AddJobPrMutationResult = Apollo.MutationResult<AddJobPrMutation>;
export type AddJobPrMutationOptions = Apollo.BaseMutationOptions<
  AddJobPrMutation,
  AddJobPrMutationVariables
>;
export const DeleteJobPrDocument = gql`
  mutation DeleteJobPR($id: String!, $deletePr: String!) {
    updateJob(id: $id, deletePr: $deletePr) {
      job {
        node {
          id
        }
        prs {
          id
          title
          githubRepoOwner
          githubRepoName
          githubPrNumber
        }
      }
    }
  }
`;
export type DeleteJobPrMutationFn = Apollo.MutationFunction<
  DeleteJobPrMutation,
  DeleteJobPrMutationVariables
>;

/**
 * __useDeleteJobPrMutation__
 *
 * To run a mutation, you first call `useDeleteJobPrMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJobPrMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJobPrMutation, { data, loading, error }] = useDeleteJobPrMutation({
 *   variables: {
 *      id: // value for 'id'
 *      deletePr: // value for 'deletePr'
 *   },
 * });
 */
export function useDeleteJobPrMutation(
  baseOptions?: Apollo.MutationHookOptions<DeleteJobPrMutation, DeleteJobPrMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<DeleteJobPrMutation, DeleteJobPrMutationVariables>(
    DeleteJobPrDocument,
    options,
  );
}
export type DeleteJobPrMutationHookResult = ReturnType<typeof useDeleteJobPrMutation>;
export type DeleteJobPrMutationResult = Apollo.MutationResult<DeleteJobPrMutation>;
export type DeleteJobPrMutationOptions = Apollo.BaseMutationOptions<
  DeleteJobPrMutation,
  DeleteJobPrMutationVariables
>;
export const UpdateAllVoteDocument = gql`
  mutation UpdateAllVote($voteId: String!, $vote: Boolean!) {
    updateAllVote(id: $voteId, vote: $vote) {
      ok
    }
  }
`;
export type UpdateAllVoteMutationFn = Apollo.MutationFunction<
  UpdateAllVoteMutation,
  UpdateAllVoteMutationVariables
>;

/**
 * __useUpdateAllVoteMutation__
 *
 * To run a mutation, you first call `useUpdateAllVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAllVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAllVoteMutation, { data, loading, error }] = useUpdateAllVoteMutation({
 *   variables: {
 *      voteId: // value for 'voteId'
 *      vote: // value for 'vote'
 *   },
 * });
 */
export function useUpdateAllVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateAllVoteMutation, UpdateAllVoteMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateAllVoteMutation, UpdateAllVoteMutationVariables>(
    UpdateAllVoteDocument,
    options,
  );
}
export type UpdateAllVoteMutationHookResult = ReturnType<typeof useUpdateAllVoteMutation>;
export type UpdateAllVoteMutationResult = Apollo.MutationResult<UpdateAllVoteMutation>;
export type UpdateAllVoteMutationOptions = Apollo.BaseMutationOptions<
  UpdateAllVoteMutation,
  UpdateAllVoteMutationVariables
>;
export const UpdatePairVoteDocument = gql`
  mutation UpdatePairVote($voteId: String!, $voteJobId: String!) {
    updatePairVote(id: $voteId, voteJobId: $voteJobId) {
      ok
    }
  }
`;
export type UpdatePairVoteMutationFn = Apollo.MutationFunction<
  UpdatePairVoteMutation,
  UpdatePairVoteMutationVariables
>;

/**
 * __useUpdatePairVoteMutation__
 *
 * To run a mutation, you first call `useUpdatePairVoteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePairVoteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePairVoteMutation, { data, loading, error }] = useUpdatePairVoteMutation({
 *   variables: {
 *      voteId: // value for 'voteId'
 *      voteJobId: // value for 'voteJobId'
 *   },
 * });
 */
export function useUpdatePairVoteMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdatePairVoteMutation, UpdatePairVoteMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdatePairVoteMutation, UpdatePairVoteMutationVariables>(
    UpdatePairVoteDocument,
    options,
  );
}
export type UpdatePairVoteMutationHookResult = ReturnType<typeof useUpdatePairVoteMutation>;
export type UpdatePairVoteMutationResult = Apollo.MutationResult<UpdatePairVoteMutation>;
export type UpdatePairVoteMutationOptions = Apollo.BaseMutationOptions<
  UpdatePairVoteMutation,
  UpdatePairVoteMutationVariables
>;
export const UpdateOwnerEiDocument = gql`
  mutation UpdateOwnerEI($statId: String!, $ownerEi: Decimal!) {
    updateIcpperStatOwnerEi(id: $statId, ownerEi: $ownerEi) {
      ei
      ownerEi
      voteEi
    }
  }
`;
export type UpdateOwnerEiMutationFn = Apollo.MutationFunction<
  UpdateOwnerEiMutation,
  UpdateOwnerEiMutationVariables
>;

/**
 * __useUpdateOwnerEiMutation__
 *
 * To run a mutation, you first call `useUpdateOwnerEiMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateOwnerEiMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateOwnerEiMutation, { data, loading, error }] = useUpdateOwnerEiMutation({
 *   variables: {
 *      statId: // value for 'statId'
 *      ownerEi: // value for 'ownerEi'
 *   },
 * });
 */
export function useUpdateOwnerEiMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateOwnerEiMutation, UpdateOwnerEiMutationVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateOwnerEiMutation, UpdateOwnerEiMutationVariables>(
    UpdateOwnerEiDocument,
    options,
  );
}
export type UpdateOwnerEiMutationHookResult = ReturnType<typeof useUpdateOwnerEiMutation>;
export type UpdateOwnerEiMutationResult = Apollo.MutationResult<UpdateOwnerEiMutation>;
export type UpdateOwnerEiMutationOptions = Apollo.BaseMutationOptions<
  UpdateOwnerEiMutation,
  UpdateOwnerEiMutationVariables
>;
export const BeginCyclePairTaskDocument = gql`
  mutation BeginCyclePairTask($cycleId: String!) {
    createCycleVotePairTaskByOwner(cycleId: $cycleId) {
      status
    }
  }
`;
export type BeginCyclePairTaskMutationFn = Apollo.MutationFunction<
  BeginCyclePairTaskMutation,
  BeginCyclePairTaskMutationVariables
>;

/**
 * __useBeginCyclePairTaskMutation__
 *
 * To run a mutation, you first call `useBeginCyclePairTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBeginCyclePairTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [beginCyclePairTaskMutation, { data, loading, error }] = useBeginCyclePairTaskMutation({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *   },
 * });
 */
export function useBeginCyclePairTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    BeginCyclePairTaskMutation,
    BeginCyclePairTaskMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<BeginCyclePairTaskMutation, BeginCyclePairTaskMutationVariables>(
    BeginCyclePairTaskDocument,
    options,
  );
}
export type BeginCyclePairTaskMutationHookResult = ReturnType<typeof useBeginCyclePairTaskMutation>;
export type BeginCyclePairTaskMutationResult = Apollo.MutationResult<BeginCyclePairTaskMutation>;
export type BeginCyclePairTaskMutationOptions = Apollo.BaseMutationOptions<
  BeginCyclePairTaskMutation,
  BeginCyclePairTaskMutationVariables
>;
export const BeginCycleVoteResultTaskDocument = gql`
  mutation BeginCycleVoteResultTask($cycleId: String!) {
    createCycleVoteResultStatTaskByOwner(cycleId: $cycleId) {
      status
    }
  }
`;
export type BeginCycleVoteResultTaskMutationFn = Apollo.MutationFunction<
  BeginCycleVoteResultTaskMutation,
  BeginCycleVoteResultTaskMutationVariables
>;

/**
 * __useBeginCycleVoteResultTaskMutation__
 *
 * To run a mutation, you first call `useBeginCycleVoteResultTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBeginCycleVoteResultTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [beginCycleVoteResultTaskMutation, { data, loading, error }] = useBeginCycleVoteResultTaskMutation({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *   },
 * });
 */
export function useBeginCycleVoteResultTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    BeginCycleVoteResultTaskMutation,
    BeginCycleVoteResultTaskMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    BeginCycleVoteResultTaskMutation,
    BeginCycleVoteResultTaskMutationVariables
  >(BeginCycleVoteResultTaskDocument, options);
}
export type BeginCycleVoteResultTaskMutationHookResult = ReturnType<
  typeof useBeginCycleVoteResultTaskMutation
>;
export type BeginCycleVoteResultTaskMutationResult =
  Apollo.MutationResult<BeginCycleVoteResultTaskMutation>;
export type BeginCycleVoteResultTaskMutationOptions = Apollo.BaseMutationOptions<
  BeginCycleVoteResultTaskMutation,
  BeginCycleVoteResultTaskMutationVariables
>;
export const BeginPublishCycleTaskDocument = gql`
  mutation BeginPublishCycleTask($cycleId: String!) {
    createCycleVoteResultPublishTaskByOwner(cycleId: $cycleId) {
      status
    }
  }
`;
export type BeginPublishCycleTaskMutationFn = Apollo.MutationFunction<
  BeginPublishCycleTaskMutation,
  BeginPublishCycleTaskMutationVariables
>;

/**
 * __useBeginPublishCycleTaskMutation__
 *
 * To run a mutation, you first call `useBeginPublishCycleTaskMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBeginPublishCycleTaskMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [beginPublishCycleTaskMutation, { data, loading, error }] = useBeginPublishCycleTaskMutation({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *   },
 * });
 */
export function useBeginPublishCycleTaskMutation(
  baseOptions?: Apollo.MutationHookOptions<
    BeginPublishCycleTaskMutation,
    BeginPublishCycleTaskMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<BeginPublishCycleTaskMutation, BeginPublishCycleTaskMutationVariables>(
    BeginPublishCycleTaskDocument,
    options,
  );
}
export type BeginPublishCycleTaskMutationHookResult = ReturnType<
  typeof useBeginPublishCycleTaskMutation
>;
export type BeginPublishCycleTaskMutationResult =
  Apollo.MutationResult<BeginPublishCycleTaskMutation>;
export type BeginPublishCycleTaskMutationOptions = Apollo.BaseMutationOptions<
  BeginPublishCycleTaskMutation,
  BeginPublishCycleTaskMutationVariables
>;
export const UpdateVotePairPublicDocument = gql`
  mutation UpdateVotePairPublic($voteId: String!, $isPublic: Boolean!) {
    changeVoteResultPublic(id: $voteId, public: $isPublic) {
      ok
    }
  }
`;
export type UpdateVotePairPublicMutationFn = Apollo.MutationFunction<
  UpdateVotePairPublicMutation,
  UpdateVotePairPublicMutationVariables
>;

/**
 * __useUpdateVotePairPublicMutation__
 *
 * To run a mutation, you first call `useUpdateVotePairPublicMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateVotePairPublicMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateVotePairPublicMutation, { data, loading, error }] = useUpdateVotePairPublicMutation({
 *   variables: {
 *      voteId: // value for 'voteId'
 *      isPublic: // value for 'isPublic'
 *   },
 * });
 */
export function useUpdateVotePairPublicMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateVotePairPublicMutation,
    UpdateVotePairPublicMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateVotePairPublicMutation, UpdateVotePairPublicMutationVariables>(
    UpdateVotePairPublicDocument,
    options,
  );
}
export type UpdateVotePairPublicMutationHookResult = ReturnType<
  typeof useUpdateVotePairPublicMutation
>;
export type UpdateVotePairPublicMutationResult =
  Apollo.MutationResult<UpdateVotePairPublicMutation>;
export type UpdateVotePairPublicMutationOptions = Apollo.BaseMutationOptions<
  UpdateVotePairPublicMutation,
  UpdateVotePairPublicMutationVariables
>;
export const MarkCyclesTokenReleasedDocument = gql`
  mutation MarkCyclesTokenReleased($daoId: String!, $cycleIds: [String]!, $unitSizeValue: String!) {
    markCyclesTokenReleased(daoId: $daoId, cycleIds: $cycleIds, unitSizeValue: $unitSizeValue) {
      ok
    }
  }
`;
export type MarkCyclesTokenReleasedMutationFn = Apollo.MutationFunction<
  MarkCyclesTokenReleasedMutation,
  MarkCyclesTokenReleasedMutationVariables
>;

/**
 * __useMarkCyclesTokenReleasedMutation__
 *
 * To run a mutation, you first call `useMarkCyclesTokenReleasedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkCyclesTokenReleasedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markCyclesTokenReleasedMutation, { data, loading, error }] = useMarkCyclesTokenReleasedMutation({
 *   variables: {
 *      daoId: // value for 'daoId'
 *      cycleIds: // value for 'cycleIds'
 *      unitSizeValue: // value for 'unitSizeValue'
 *   },
 * });
 */
export function useMarkCyclesTokenReleasedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    MarkCyclesTokenReleasedMutation,
    MarkCyclesTokenReleasedMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    MarkCyclesTokenReleasedMutation,
    MarkCyclesTokenReleasedMutationVariables
  >(MarkCyclesTokenReleasedDocument, options);
}
export type MarkCyclesTokenReleasedMutationHookResult = ReturnType<
  typeof useMarkCyclesTokenReleasedMutation
>;
export type MarkCyclesTokenReleasedMutationResult =
  Apollo.MutationResult<MarkCyclesTokenReleasedMutation>;
export type MarkCyclesTokenReleasedMutationOptions = Apollo.BaseMutationOptions<
  MarkCyclesTokenReleasedMutation,
  MarkCyclesTokenReleasedMutationVariables
>;
export const DaoDocument = gql`
  query DAO($id: String!) {
    dao(id: $id) {
      datum {
        id
        number
        name
        desc
        logo
        ownerId
        createAt
        updateAt
      }
      following {
        total
      }
    }
  }
`;

/**
 * __useDaoQuery__
 *
 * To run a query within a React component, call `useDaoQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDaoQuery(baseOptions: Apollo.QueryHookOptions<DaoQuery, DaoQueryVariables>) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoQuery, DaoQueryVariables>(DaoDocument, options);
}
export function useDaoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoQuery, DaoQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoQuery, DaoQueryVariables>(DaoDocument, options);
}
export type DaoQueryHookResult = ReturnType<typeof useDaoQuery>;
export type DaoLazyQueryHookResult = ReturnType<typeof useDaoLazyQuery>;
export type DaoQueryResult = Apollo.QueryResult<DaoQuery, DaoQueryVariables>;
export const DaoJobConfigDocument = gql`
  query DAOJobConfig($daoId: String!) {
    daoJobConfig(daoId: $daoId) {
      datum {
        id
        daoId
        createAt
        deadlineDay
        deadlineTime
        pairBeginDay
        pairBeginHour
        pairEndDay
        pairEndHour
        timeZone
        timeZoneRegion
        updateAt
        votingBeginDay
        votingBeginHour
        votingEndDay
        votingEndHour
      }
      existedLastCycle {
        timeZone
        beginAt
        endAt
        pairBeginAt
        pairEndAt
        voteBeginAt
        voteEndAt
      }
      getNextCycle {
        timeZone
        beginAt
        endAt
        pairBeginAt
        pairEndAt
        voteBeginAt
        voteEndAt
      }
    }
  }
`;

/**
 * __useDaoJobConfigQuery__
 *
 * To run a query within a React component, call `useDaoJobConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoJobConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoJobConfigQuery({
 *   variables: {
 *      daoId: // value for 'daoId'
 *   },
 * });
 */
export function useDaoJobConfigQuery(
  baseOptions: Apollo.QueryHookOptions<DaoJobConfigQuery, DaoJobConfigQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoJobConfigQuery, DaoJobConfigQueryVariables>(
    DaoJobConfigDocument,
    options,
  );
}
export function useDaoJobConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoJobConfigQuery, DaoJobConfigQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoJobConfigQuery, DaoJobConfigQueryVariables>(
    DaoJobConfigDocument,
    options,
  );
}
export type DaoJobConfigQueryHookResult = ReturnType<typeof useDaoJobConfigQuery>;
export type DaoJobConfigLazyQueryHookResult = ReturnType<typeof useDaoJobConfigLazyQuery>;
export type DaoJobConfigQueryResult = Apollo.QueryResult<
  DaoJobConfigQuery,
  DaoJobConfigQueryVariables
>;
export const DaoJobConfigPreviewNextCycleDocument = gql`
  query DAOJobConfigPreviewNextCycle(
    $daoId: String!
    $timeZone: Int
    $deadlineDay: Int
    $deadlineTime: Int
    $pairBeginDay: Int
    $pairBeginHour: Int
    $pairEndDay: Int
    $pairEndHour: Int
    $votingBeginDay: Int
    $votingBeginHour: Int
    $votingEndDay: Int
    $votingEndHour: Int
  ) {
    daoJobConfig(daoId: $daoId) {
      previewNextCycle(
        timeZone: $timeZone
        deadlineDay: $deadlineDay
        deadlineTime: $deadlineTime
        pairBeginDay: $pairBeginDay
        pairBeginHour: $pairBeginHour
        pairEndDay: $pairEndDay
        pairEndHour: $pairEndHour
        votingBeginDay: $votingBeginDay
        votingBeginHour: $votingBeginHour
        votingEndDay: $votingEndDay
        votingEndHour: $votingEndHour
      ) {
        timeZone
        beginAt
        endAt
        pairBeginAt
        pairEndAt
        voteBeginAt
        voteEndAt
      }
    }
  }
`;

/**
 * __useDaoJobConfigPreviewNextCycleQuery__
 *
 * To run a query within a React component, call `useDaoJobConfigPreviewNextCycleQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoJobConfigPreviewNextCycleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoJobConfigPreviewNextCycleQuery({
 *   variables: {
 *      daoId: // value for 'daoId'
 *      timeZone: // value for 'timeZone'
 *      deadlineDay: // value for 'deadlineDay'
 *      deadlineTime: // value for 'deadlineTime'
 *      pairBeginDay: // value for 'pairBeginDay'
 *      pairBeginHour: // value for 'pairBeginHour'
 *      pairEndDay: // value for 'pairEndDay'
 *      pairEndHour: // value for 'pairEndHour'
 *      votingBeginDay: // value for 'votingBeginDay'
 *      votingBeginHour: // value for 'votingBeginHour'
 *      votingEndDay: // value for 'votingEndDay'
 *      votingEndHour: // value for 'votingEndHour'
 *   },
 * });
 */
export function useDaoJobConfigPreviewNextCycleQuery(
  baseOptions: Apollo.QueryHookOptions<
    DaoJobConfigPreviewNextCycleQuery,
    DaoJobConfigPreviewNextCycleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    DaoJobConfigPreviewNextCycleQuery,
    DaoJobConfigPreviewNextCycleQueryVariables
  >(DaoJobConfigPreviewNextCycleDocument, options);
}
export function useDaoJobConfigPreviewNextCycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    DaoJobConfigPreviewNextCycleQuery,
    DaoJobConfigPreviewNextCycleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    DaoJobConfigPreviewNextCycleQuery,
    DaoJobConfigPreviewNextCycleQueryVariables
  >(DaoJobConfigPreviewNextCycleDocument, options);
}
export type DaoJobConfigPreviewNextCycleQueryHookResult = ReturnType<
  typeof useDaoJobConfigPreviewNextCycleQuery
>;
export type DaoJobConfigPreviewNextCycleLazyQueryHookResult = ReturnType<
  typeof useDaoJobConfigPreviewNextCycleLazyQuery
>;
export type DaoJobConfigPreviewNextCycleQueryResult = Apollo.QueryResult<
  DaoJobConfigPreviewNextCycleQuery,
  DaoJobConfigPreviewNextCycleQueryVariables
>;
export const DaoTokenConfigDocument = gql`
  query DAOTokenConfig($daoId: String!) {
    daoTokenConfig(daoId: $daoId) {
      ethDaoId
    }
  }
`;

/**
 * __useDaoTokenConfigQuery__
 *
 * To run a query within a React component, call `useDaoTokenConfigQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoTokenConfigQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoTokenConfigQuery({
 *   variables: {
 *      daoId: // value for 'daoId'
 *   },
 * });
 */
export function useDaoTokenConfigQuery(
  baseOptions: Apollo.QueryHookOptions<DaoTokenConfigQuery, DaoTokenConfigQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoTokenConfigQuery, DaoTokenConfigQueryVariables>(
    DaoTokenConfigDocument,
    options,
  );
}
export function useDaoTokenConfigLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoTokenConfigQuery, DaoTokenConfigQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoTokenConfigQuery, DaoTokenConfigQueryVariables>(
    DaoTokenConfigDocument,
    options,
  );
}
export type DaoTokenConfigQueryHookResult = ReturnType<typeof useDaoTokenConfigQuery>;
export type DaoTokenConfigLazyQueryHookResult = ReturnType<typeof useDaoTokenConfigLazyQuery>;
export type DaoTokenConfigQueryResult = Apollo.QueryResult<
  DaoTokenConfigQuery,
  DaoTokenConfigQueryVariables
>;
export const DaoFollowInfoDocument = gql`
  query DAOFollowInfo($id: String!, $userId: String!) {
    dao(id: $id) {
      datum {
        id
        number
        name
        desc
        logo
        ownerId
        createAt
        updateAt
      }
      following {
        total
        followers(userId: $userId) {
          createAt
        }
      }
    }
  }
`;

/**
 * __useDaoFollowInfoQuery__
 *
 * To run a query within a React component, call `useDaoFollowInfoQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoFollowInfoQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoFollowInfoQuery({
 *   variables: {
 *      id: // value for 'id'
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useDaoFollowInfoQuery(
  baseOptions: Apollo.QueryHookOptions<DaoFollowInfoQuery, DaoFollowInfoQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoFollowInfoQuery, DaoFollowInfoQueryVariables>(
    DaoFollowInfoDocument,
    options,
  );
}
export function useDaoFollowInfoLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoFollowInfoQuery, DaoFollowInfoQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoFollowInfoQuery, DaoFollowInfoQueryVariables>(
    DaoFollowInfoDocument,
    options,
  );
}
export type DaoFollowInfoQueryHookResult = ReturnType<typeof useDaoFollowInfoQuery>;
export type DaoFollowInfoLazyQueryHookResult = ReturnType<typeof useDaoFollowInfoLazyQuery>;
export type DaoFollowInfoQueryResult = Apollo.QueryResult<
  DaoFollowInfoQuery,
  DaoFollowInfoQueryVariables
>;
export const DaoListDocument = gql`
  query DAOList(
    $filter: DAOsFilterEnum
    $sorted: DAOsSortedEnum
    $sortedType: DAOsSortedTypeEnum
    $search: String
    $first: Int
    $offset: Int
  ) {
    daos(
      filter: $filter
      sorted: $sorted
      sortedType: $sortedType
      search: $search
      offset: $offset
      first: $first
    ) {
      dao {
        datum {
          createAt
          desc
          id
          logo
          name
          ownerId
          updateAt
        }
        stat {
          following
          job
          size
          token
        }
        isFollowing
        isOwner
      }
      stat {
        icpper
        size
        income
      }
      total
    }
  }
`;

/**
 * __useDaoListQuery__
 *
 * To run a query within a React component, call `useDaoListQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoListQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *      sorted: // value for 'sorted'
 *      sortedType: // value for 'sortedType'
 *      search: // value for 'search'
 *      first: // value for 'first'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useDaoListQuery(
  baseOptions?: Apollo.QueryHookOptions<DaoListQuery, DaoListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoListQuery, DaoListQueryVariables>(DaoListDocument, options);
}
export function useDaoListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoListQuery, DaoListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoListQuery, DaoListQueryVariables>(DaoListDocument, options);
}
export type DaoListQueryHookResult = ReturnType<typeof useDaoListQuery>;
export type DaoListLazyQueryHookResult = ReturnType<typeof useDaoListLazyQuery>;
export type DaoListQueryResult = Apollo.QueryResult<DaoListQuery, DaoListQueryVariables>;
export const UserJobDaoListDocument = gql`
  query UserJobDAOList($userName: String) {
    daos(filter: member, offset: 0, first: 100, userName: $userName) {
      dao {
        datum {
          id
          name
        }
      }
    }
  }
`;

/**
 * __useUserJobDaoListQuery__
 *
 * To run a query within a React component, call `useUserJobDaoListQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserJobDaoListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserJobDaoListQuery({
 *   variables: {
 *      userName: // value for 'userName'
 *   },
 * });
 */
export function useUserJobDaoListQuery(
  baseOptions?: Apollo.QueryHookOptions<UserJobDaoListQuery, UserJobDaoListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<UserJobDaoListQuery, UserJobDaoListQueryVariables>(
    UserJobDaoListDocument,
    options,
  );
}
export function useUserJobDaoListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<UserJobDaoListQuery, UserJobDaoListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<UserJobDaoListQuery, UserJobDaoListQueryVariables>(
    UserJobDaoListDocument,
    options,
  );
}
export type UserJobDaoListQueryHookResult = ReturnType<typeof useUserJobDaoListQuery>;
export type UserJobDaoListLazyQueryHookResult = ReturnType<typeof useUserJobDaoListLazyQuery>;
export type UserJobDaoListQueryResult = Apollo.QueryResult<
  UserJobDaoListQuery,
  UserJobDaoListQueryVariables
>;
export const DaoGithubAppStatusDocument = gql`
  query DAOGithubAppStatus($name: String!) {
    daoGithubAppStatus(name: $name) {
      githubAppName
      githubOrgId
      isExists
      isGithubOrgOwner
      isIcpAppInstalled
    }
  }
`;

/**
 * __useDaoGithubAppStatusQuery__
 *
 * To run a query within a React component, call `useDaoGithubAppStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoGithubAppStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoGithubAppStatusQuery({
 *   variables: {
 *      name: // value for 'name'
 *   },
 * });
 */
export function useDaoGithubAppStatusQuery(
  baseOptions: Apollo.QueryHookOptions<DaoGithubAppStatusQuery, DaoGithubAppStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoGithubAppStatusQuery, DaoGithubAppStatusQueryVariables>(
    DaoGithubAppStatusDocument,
    options,
  );
}
export function useDaoGithubAppStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    DaoGithubAppStatusQuery,
    DaoGithubAppStatusQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoGithubAppStatusQuery, DaoGithubAppStatusQueryVariables>(
    DaoGithubAppStatusDocument,
    options,
  );
}
export type DaoGithubAppStatusQueryHookResult = ReturnType<typeof useDaoGithubAppStatusQuery>;
export type DaoGithubAppStatusLazyQueryHookResult = ReturnType<
  typeof useDaoGithubAppStatusLazyQuery
>;
export type DaoGithubAppStatusQueryResult = Apollo.QueryResult<
  DaoGithubAppStatusQuery,
  DaoGithubAppStatusQueryVariables
>;
export const JobListDocument = gql`
  query JobList(
    $beginTime: Int
    $endTime: Int
    $daoName: String!
    $first: Int
    $offset: Int
    $sorted: JobSortedEnum
    $sortedType: SortedTypeEnum
    $userName: String
  ) {
    jobs(
      beginTime: $beginTime
      daoName: $daoName
      endTime: $endTime
      first: $first
      offset: $offset
      sorted: $sorted
      sortedType: $sortedType
      userName: $userName
    ) {
      job {
        node {
          id
          title
          size
          status
          githubRepoOwner
          githubRepoName
          githubIssueNumber
          income
        }
        prs {
          id
          title
          githubRepoOwner
          githubRepoName
          githubPrNumber
        }
      }
      stat {
        size
        tokenCount
        tokenName
      }
      total
    }
  }
`;

/**
 * __useJobListQuery__
 *
 * To run a query within a React component, call `useJobListQuery` and pass it any options that fit your needs.
 * When your component renders, `useJobListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJobListQuery({
 *   variables: {
 *      beginTime: // value for 'beginTime'
 *      endTime: // value for 'endTime'
 *      daoName: // value for 'daoName'
 *      first: // value for 'first'
 *      offset: // value for 'offset'
 *      sorted: // value for 'sorted'
 *      sortedType: // value for 'sortedType'
 *      userName: // value for 'userName'
 *   },
 * });
 */
export function useJobListQuery(
  baseOptions: Apollo.QueryHookOptions<JobListQuery, JobListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<JobListQuery, JobListQueryVariables>(JobListDocument, options);
}
export function useJobListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<JobListQuery, JobListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<JobListQuery, JobListQueryVariables>(JobListDocument, options);
}
export type JobListQueryHookResult = ReturnType<typeof useJobListQuery>;
export type JobListLazyQueryHookResult = ReturnType<typeof useJobListLazyQuery>;
export type JobListQueryResult = Apollo.QueryResult<JobListQuery, JobListQueryVariables>;
export const CycleJobListDocument = gql`
  query CycleJobList(
    $cycleId: String!
    $first: Int
    $offset: Int
    $pairType: JobsQueryPairTypeEnum
    $sorted: JobsQuerySortedEnum
    $sortedType: JobsQuerySortedTypeEnum
  ) {
    cycle(id: $cycleId) {
      jobs(
        first: $first
        offset: $offset
        pairType: $pairType
        sorted: $sorted
        sortedType: $sortedType
      ) {
        nodes {
          datum {
            id
            githubRepoOwner
            githubRepoName
            githubIssueNumber
            title
            size
            income
            pairType
          }
          user {
            id
            avatar
            nickname
            githubLogin
          }
        }
        total
      }
    }
  }
`;

/**
 * __useCycleJobListQuery__
 *
 * To run a query within a React component, call `useCycleJobListQuery` and pass it any options that fit your needs.
 * When your component renders, `useCycleJobListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCycleJobListQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *      first: // value for 'first'
 *      offset: // value for 'offset'
 *      pairType: // value for 'pairType'
 *      sorted: // value for 'sorted'
 *      sortedType: // value for 'sortedType'
 *   },
 * });
 */
export function useCycleJobListQuery(
  baseOptions: Apollo.QueryHookOptions<CycleJobListQuery, CycleJobListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CycleJobListQuery, CycleJobListQueryVariables>(
    CycleJobListDocument,
    options,
  );
}
export function useCycleJobListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CycleJobListQuery, CycleJobListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CycleJobListQuery, CycleJobListQueryVariables>(
    CycleJobListDocument,
    options,
  );
}
export type CycleJobListQueryHookResult = ReturnType<typeof useCycleJobListQuery>;
export type CycleJobListLazyQueryHookResult = ReturnType<typeof useCycleJobListLazyQuery>;
export type CycleJobListQueryResult = Apollo.QueryResult<
  CycleJobListQuery,
  CycleJobListQueryVariables
>;
export const CycleIcpperListDocument = gql`
  query CycleIcpperList(
    $cycleId: String!
    $first: Int
    $offset: Int
    $sorted: CycleIcpperStatSortedEnum
    $sortedType: CycleIcpperStatSortedTypeEnum
  ) {
    cycle(id: $cycleId) {
      icpperStats(first: $first, offset: $offset, sorted: $sorted, sortedType: $sortedType) {
        nodes {
          datum {
            id
            jobCount
            size
            income
            ei
            beDeductedSizeByReview
            haveTwoTimesLt04
            haveTwoTimesLt08
            unVotedAllVote
          }
          icpper {
            id
            avatar
            nickname
            githubLogin
          }
          lastEi
          beReviewerHasWarningUsers {
            id
            nickname
          }
        }
        total
      }
    }
  }
`;

/**
 * __useCycleIcpperListQuery__
 *
 * To run a query within a React component, call `useCycleIcpperListQuery` and pass it any options that fit your needs.
 * When your component renders, `useCycleIcpperListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCycleIcpperListQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *      first: // value for 'first'
 *      offset: // value for 'offset'
 *      sorted: // value for 'sorted'
 *      sortedType: // value for 'sortedType'
 *   },
 * });
 */
export function useCycleIcpperListQuery(
  baseOptions: Apollo.QueryHookOptions<CycleIcpperListQuery, CycleIcpperListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CycleIcpperListQuery, CycleIcpperListQueryVariables>(
    CycleIcpperListDocument,
    options,
  );
}
export function useCycleIcpperListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CycleIcpperListQuery, CycleIcpperListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CycleIcpperListQuery, CycleIcpperListQueryVariables>(
    CycleIcpperListDocument,
    options,
  );
}
export type CycleIcpperListQueryHookResult = ReturnType<typeof useCycleIcpperListQuery>;
export type CycleIcpperListLazyQueryHookResult = ReturnType<typeof useCycleIcpperListLazyQuery>;
export type CycleIcpperListQueryResult = Apollo.QueryResult<
  CycleIcpperListQuery,
  CycleIcpperListQueryVariables
>;
export const OwnerCycleIcpperListDocument = gql`
  query OwnerCycleIcpperList(
    $cycleId: String!
    $first: Int
    $offset: Int
    $sorted: CycleIcpperStatSortedEnum
    $sortedType: CycleIcpperStatSortedTypeEnum
  ) {
    cycle(id: $cycleId) {
      icpperStats(first: $first, offset: $offset, sorted: $sorted, sortedType: $sortedType) {
        nodes {
          datum {
            id
            jobCount
            size
            income
            ei
            ownerEi
            voteEi
            beDeductedSizeByReview
            haveTwoTimesLt04
            haveTwoTimesLt08
            unVotedAllVote
          }
          icpper {
            id
            avatar
            nickname
            githubLogin
          }
          lastEi
          beReviewerHasWarningUsers {
            id
            nickname
          }
        }
        total
      }
    }
  }
`;

/**
 * __useOwnerCycleIcpperListQuery__
 *
 * To run a query within a React component, call `useOwnerCycleIcpperListQuery` and pass it any options that fit your needs.
 * When your component renders, `useOwnerCycleIcpperListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOwnerCycleIcpperListQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *      first: // value for 'first'
 *      offset: // value for 'offset'
 *      sorted: // value for 'sorted'
 *      sortedType: // value for 'sortedType'
 *   },
 * });
 */
export function useOwnerCycleIcpperListQuery(
  baseOptions: Apollo.QueryHookOptions<
    OwnerCycleIcpperListQuery,
    OwnerCycleIcpperListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<OwnerCycleIcpperListQuery, OwnerCycleIcpperListQueryVariables>(
    OwnerCycleIcpperListDocument,
    options,
  );
}
export function useOwnerCycleIcpperListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    OwnerCycleIcpperListQuery,
    OwnerCycleIcpperListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<OwnerCycleIcpperListQuery, OwnerCycleIcpperListQueryVariables>(
    OwnerCycleIcpperListDocument,
    options,
  );
}
export type OwnerCycleIcpperListQueryHookResult = ReturnType<typeof useOwnerCycleIcpperListQuery>;
export type OwnerCycleIcpperListLazyQueryHookResult = ReturnType<
  typeof useOwnerCycleIcpperListLazyQuery
>;
export type OwnerCycleIcpperListQueryResult = Apollo.QueryResult<
  OwnerCycleIcpperListQuery,
  OwnerCycleIcpperListQueryVariables
>;
export const CycleVoteListDocument = gql`
  query CycleVoteList(
    $cycleId: String!
    $first: Int
    $offset: Int
    $isMyself: Boolean
    $isPublic: Boolean
  ) {
    cycle(id: $cycleId) {
      datum {
        beginAt
        endAt
        voteBeginAt
        voteEndAt
      }
      votes(first: $first, offset: $offset, isMyself: $isMyself, isPublic: $isPublic) {
        total
        nodes {
          datum {
            id
            isResultPublic
            voteJobId
            voteResultStatTypeAll
            voteType
            voterId
          }
          leftJob {
            datum {
              title
              githubRepoOwner
              githubRepoName
              githubIssueNumber
              size
              pairType
              id
            }
            user {
              id
              githubLogin
              nickname
            }
          }
          rightJob {
            datum {
              title
              githubRepoOwner
              githubRepoName
              githubIssueNumber
              pairType
              size
              id
            }
            user {
              id
              githubLogin
              nickname
            }
          }
          voteJob {
            datum {
              id
            }
          }
          voter {
            id
            githubLogin
            nickname
          }
        }
      }
    }
  }
`;

/**
 * __useCycleVoteListQuery__
 *
 * To run a query within a React component, call `useCycleVoteListQuery` and pass it any options that fit your needs.
 * When your component renders, `useCycleVoteListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCycleVoteListQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *      first: // value for 'first'
 *      offset: // value for 'offset'
 *      isMyself: // value for 'isMyself'
 *      isPublic: // value for 'isPublic'
 *   },
 * });
 */
export function useCycleVoteListQuery(
  baseOptions: Apollo.QueryHookOptions<CycleVoteListQuery, CycleVoteListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CycleVoteListQuery, CycleVoteListQueryVariables>(
    CycleVoteListDocument,
    options,
  );
}
export function useCycleVoteListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CycleVoteListQuery, CycleVoteListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CycleVoteListQuery, CycleVoteListQueryVariables>(
    CycleVoteListDocument,
    options,
  );
}
export type CycleVoteListQueryHookResult = ReturnType<typeof useCycleVoteListQuery>;
export type CycleVoteListLazyQueryHookResult = ReturnType<typeof useCycleVoteListLazyQuery>;
export type CycleVoteListQueryResult = Apollo.QueryResult<
  CycleVoteListQuery,
  CycleVoteListQueryVariables
>;
export const DaoCycleDocument = gql`
  query DAOCycle($daoId: String!) {
    dao(id: $daoId) {
      cycles {
        nodes {
          datum {
            id
            timeZone
            beginAt
            endAt
            pairBeginAt
            pairEndAt
            voteBeginAt
            voteEndAt
            pairedAt
            voteResultPublishedAt
            voteResultStatAt
          }
        }
      }
    }
  }
`;

/**
 * __useDaoCycleQuery__
 *
 * To run a query within a React component, call `useDaoCycleQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoCycleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoCycleQuery({
 *   variables: {
 *      daoId: // value for 'daoId'
 *   },
 * });
 */
export function useDaoCycleQuery(
  baseOptions: Apollo.QueryHookOptions<DaoCycleQuery, DaoCycleQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoCycleQuery, DaoCycleQueryVariables>(DaoCycleDocument, options);
}
export function useDaoCycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoCycleQuery, DaoCycleQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoCycleQuery, DaoCycleQueryVariables>(DaoCycleDocument, options);
}
export type DaoCycleQueryHookResult = ReturnType<typeof useDaoCycleQuery>;
export type DaoCycleLazyQueryHookResult = ReturnType<typeof useDaoCycleLazyQuery>;
export type DaoCycleQueryResult = Apollo.QueryResult<DaoCycleQuery, DaoCycleQueryVariables>;
export const CycleStatDataDocument = gql`
  query CycleStatData($cycleId: String!) {
    cycle(id: $cycleId) {
      stat {
        icpperCount
        jobCount
        size
      }
    }
  }
`;

/**
 * __useCycleStatDataQuery__
 *
 * To run a query within a React component, call `useCycleStatDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useCycleStatDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCycleStatDataQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *   },
 * });
 */
export function useCycleStatDataQuery(
  baseOptions: Apollo.QueryHookOptions<CycleStatDataQuery, CycleStatDataQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CycleStatDataQuery, CycleStatDataQueryVariables>(
    CycleStatDataDocument,
    options,
  );
}
export function useCycleStatDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CycleStatDataQuery, CycleStatDataQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CycleStatDataQuery, CycleStatDataQueryVariables>(
    CycleStatDataDocument,
    options,
  );
}
export type CycleStatDataQueryHookResult = ReturnType<typeof useCycleStatDataQuery>;
export type CycleStatDataLazyQueryHookResult = ReturnType<typeof useCycleStatDataLazyQuery>;
export type CycleStatDataQueryResult = Apollo.QueryResult<
  CycleStatDataQuery,
  CycleStatDataQueryVariables
>;
export const CyclePairStatusDocument = gql`
  query CyclePairStatus($cycleId: String!) {
    cycle(id: $cycleId) {
      pairTask {
        status
      }
    }
  }
`;

/**
 * __useCyclePairStatusQuery__
 *
 * To run a query within a React component, call `useCyclePairStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useCyclePairStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCyclePairStatusQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *   },
 * });
 */
export function useCyclePairStatusQuery(
  baseOptions: Apollo.QueryHookOptions<CyclePairStatusQuery, CyclePairStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CyclePairStatusQuery, CyclePairStatusQueryVariables>(
    CyclePairStatusDocument,
    options,
  );
}
export function useCyclePairStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<CyclePairStatusQuery, CyclePairStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CyclePairStatusQuery, CyclePairStatusQueryVariables>(
    CyclePairStatusDocument,
    options,
  );
}
export type CyclePairStatusQueryHookResult = ReturnType<typeof useCyclePairStatusQuery>;
export type CyclePairStatusLazyQueryHookResult = ReturnType<typeof useCyclePairStatusLazyQuery>;
export type CyclePairStatusQueryResult = Apollo.QueryResult<
  CyclePairStatusQuery,
  CyclePairStatusQueryVariables
>;
export const CycleVoteResultStatusDocument = gql`
  query CycleVoteResultStatus($cycleId: String!) {
    cycle(id: $cycleId) {
      voteResultStatTask {
        status
      }
    }
  }
`;

/**
 * __useCycleVoteResultStatusQuery__
 *
 * To run a query within a React component, call `useCycleVoteResultStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useCycleVoteResultStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCycleVoteResultStatusQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *   },
 * });
 */
export function useCycleVoteResultStatusQuery(
  baseOptions: Apollo.QueryHookOptions<
    CycleVoteResultStatusQuery,
    CycleVoteResultStatusQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CycleVoteResultStatusQuery, CycleVoteResultStatusQueryVariables>(
    CycleVoteResultStatusDocument,
    options,
  );
}
export function useCycleVoteResultStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CycleVoteResultStatusQuery,
    CycleVoteResultStatusQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CycleVoteResultStatusQuery, CycleVoteResultStatusQueryVariables>(
    CycleVoteResultStatusDocument,
    options,
  );
}
export type CycleVoteResultStatusQueryHookResult = ReturnType<typeof useCycleVoteResultStatusQuery>;
export type CycleVoteResultStatusLazyQueryHookResult = ReturnType<
  typeof useCycleVoteResultStatusLazyQuery
>;
export type CycleVoteResultStatusQueryResult = Apollo.QueryResult<
  CycleVoteResultStatusQuery,
  CycleVoteResultStatusQueryVariables
>;
export const CyclePublishStatusDocument = gql`
  query CyclePublishStatus($cycleId: String!) {
    cycle(id: $cycleId) {
      voteResultPublishTask {
        status
      }
    }
  }
`;

/**
 * __useCyclePublishStatusQuery__
 *
 * To run a query within a React component, call `useCyclePublishStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useCyclePublishStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCyclePublishStatusQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *   },
 * });
 */
export function useCyclePublishStatusQuery(
  baseOptions: Apollo.QueryHookOptions<CyclePublishStatusQuery, CyclePublishStatusQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CyclePublishStatusQuery, CyclePublishStatusQueryVariables>(
    CyclePublishStatusDocument,
    options,
  );
}
export function useCyclePublishStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CyclePublishStatusQuery,
    CyclePublishStatusQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CyclePublishStatusQuery, CyclePublishStatusQueryVariables>(
    CyclePublishStatusDocument,
    options,
  );
}
export type CyclePublishStatusQueryHookResult = ReturnType<typeof useCyclePublishStatusQuery>;
export type CyclePublishStatusLazyQueryHookResult = ReturnType<
  typeof useCyclePublishStatusLazyQuery
>;
export type CyclePublishStatusQueryResult = Apollo.QueryResult<
  CyclePublishStatusQuery,
  CyclePublishStatusQueryVariables
>;
export const DaoVotingCycleDocument = gql`
  query DAOVotingCycle($daoId: String!) {
    dao(id: $daoId) {
      cycles(filter: voting) {
        nodes {
          datum {
            id
            beginAt
            endAt
            voteBeginAt
            voteEndAt
          }
        }
      }
    }
  }
`;

/**
 * __useDaoVotingCycleQuery__
 *
 * To run a query within a React component, call `useDaoVotingCycleQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoVotingCycleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoVotingCycleQuery({
 *   variables: {
 *      daoId: // value for 'daoId'
 *   },
 * });
 */
export function useDaoVotingCycleQuery(
  baseOptions: Apollo.QueryHookOptions<DaoVotingCycleQuery, DaoVotingCycleQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoVotingCycleQuery, DaoVotingCycleQueryVariables>(
    DaoVotingCycleDocument,
    options,
  );
}
export function useDaoVotingCycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoVotingCycleQuery, DaoVotingCycleQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoVotingCycleQuery, DaoVotingCycleQueryVariables>(
    DaoVotingCycleDocument,
    options,
  );
}
export type DaoVotingCycleQueryHookResult = ReturnType<typeof useDaoVotingCycleQuery>;
export type DaoVotingCycleLazyQueryHookResult = ReturnType<typeof useDaoVotingCycleLazyQuery>;
export type DaoVotingCycleQueryResult = Apollo.QueryResult<
  DaoVotingCycleQuery,
  DaoVotingCycleQueryVariables
>;
export const DaoProcessingCycleDocument = gql`
  query DAOProcessingCycle($daoId: String!) {
    dao(id: $daoId) {
      cycles(filter: processing) {
        nodes {
          datum {
            id
            beginAt
            endAt
          }
        }
      }
    }
  }
`;

/**
 * __useDaoProcessingCycleQuery__
 *
 * To run a query within a React component, call `useDaoProcessingCycleQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoProcessingCycleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoProcessingCycleQuery({
 *   variables: {
 *      daoId: // value for 'daoId'
 *   },
 * });
 */
export function useDaoProcessingCycleQuery(
  baseOptions: Apollo.QueryHookOptions<DaoProcessingCycleQuery, DaoProcessingCycleQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoProcessingCycleQuery, DaoProcessingCycleQueryVariables>(
    DaoProcessingCycleDocument,
    options,
  );
}
export function useDaoProcessingCycleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    DaoProcessingCycleQuery,
    DaoProcessingCycleQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoProcessingCycleQuery, DaoProcessingCycleQueryVariables>(
    DaoProcessingCycleDocument,
    options,
  );
}
export type DaoProcessingCycleQueryHookResult = ReturnType<typeof useDaoProcessingCycleQuery>;
export type DaoProcessingCycleLazyQueryHookResult = ReturnType<
  typeof useDaoProcessingCycleLazyQuery
>;
export type DaoProcessingCycleQueryResult = Apollo.QueryResult<
  DaoProcessingCycleQuery,
  DaoProcessingCycleQueryVariables
>;
export const DaoCycleVoteListDocument = gql`
  query DAOCycleVoteList($cycleId: String!, $first: Int, $offset: Int) {
    cycle(id: $cycleId) {
      datum {
        beginAt
        endAt
        voteBeginAt
        voteEndAt
      }
      votes(first: $first, offset: $offset, isMyself: true) {
        total
        nodes {
          datum {
            id
            isResultPublic
            voteJobId
            voteResultStatTypeAll
            voteType
            voterId
          }
          leftJob {
            datum {
              title
              githubRepoOwner
              githubRepoName
              githubIssueNumber
              size
              pairType
              id
            }
            user {
              id
              githubLogin
              nickname
            }
          }
          rightJob {
            datum {
              title
              githubRepoOwner
              githubRepoName
              githubIssueNumber
              pairType
              size
              id
            }
            user {
              id
              githubLogin
              nickname
            }
          }
          voteJob {
            datum {
              id
            }
          }
          voter {
            id
            githubLogin
            nickname
          }
          selfVoteResultTypeAll
        }
      }
    }
  }
`;

/**
 * __useDaoCycleVoteListQuery__
 *
 * To run a query within a React component, call `useDaoCycleVoteListQuery` and pass it any options that fit your needs.
 * When your component renders, `useDaoCycleVoteListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useDaoCycleVoteListQuery({
 *   variables: {
 *      cycleId: // value for 'cycleId'
 *      first: // value for 'first'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useDaoCycleVoteListQuery(
  baseOptions: Apollo.QueryHookOptions<DaoCycleVoteListQuery, DaoCycleVoteListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<DaoCycleVoteListQuery, DaoCycleVoteListQueryVariables>(
    DaoCycleVoteListDocument,
    options,
  );
}
export function useDaoCycleVoteListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<DaoCycleVoteListQuery, DaoCycleVoteListQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<DaoCycleVoteListQuery, DaoCycleVoteListQueryVariables>(
    DaoCycleVoteListDocument,
    options,
  );
}
export type DaoCycleVoteListQueryHookResult = ReturnType<typeof useDaoCycleVoteListQuery>;
export type DaoCycleVoteListLazyQueryHookResult = ReturnType<typeof useDaoCycleVoteListLazyQuery>;
export type DaoCycleVoteListQueryResult = Apollo.QueryResult<
  DaoCycleVoteListQuery,
  DaoCycleVoteListQueryVariables
>;
export const CyclesByTokenUnreleasedListDocument = gql`
  query CyclesByTokenUnreleasedList($lastTimestamp: Int!) {
    cyclesByTokenUnreleased(lastTimestamp: $lastTimestamp) {
      nodes {
        datum {
          id
          daoId
          timeZone
          beginAt
          endAt
          voteResultPublishedAt
        }
        icpperStats {
          nodes {
            datum {
              cycleId
              jobSize
              size
            }
            icpper {
              id
              githubLogin
              nickname
              erc20Address
            }
          }
        }
      }
    }
  }
`;

/**
 * __useCyclesByTokenUnreleasedListQuery__
 *
 * To run a query within a React component, call `useCyclesByTokenUnreleasedListQuery` and pass it any options that fit your needs.
 * When your component renders, `useCyclesByTokenUnreleasedListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCyclesByTokenUnreleasedListQuery({
 *   variables: {
 *      lastTimestamp: // value for 'lastTimestamp'
 *   },
 * });
 */
export function useCyclesByTokenUnreleasedListQuery(
  baseOptions: Apollo.QueryHookOptions<
    CyclesByTokenUnreleasedListQuery,
    CyclesByTokenUnreleasedListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    CyclesByTokenUnreleasedListQuery,
    CyclesByTokenUnreleasedListQueryVariables
  >(CyclesByTokenUnreleasedListDocument, options);
}
export function useCyclesByTokenUnreleasedListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CyclesByTokenUnreleasedListQuery,
    CyclesByTokenUnreleasedListQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CyclesByTokenUnreleasedListQuery,
    CyclesByTokenUnreleasedListQueryVariables
  >(CyclesByTokenUnreleasedListDocument, options);
}
export type CyclesByTokenUnreleasedListQueryHookResult = ReturnType<
  typeof useCyclesByTokenUnreleasedListQuery
>;
export type CyclesByTokenUnreleasedListLazyQueryHookResult = ReturnType<
  typeof useCyclesByTokenUnreleasedListLazyQuery
>;
export type CyclesByTokenUnreleasedListQueryResult = Apollo.QueryResult<
  CyclesByTokenUnreleasedListQuery,
  CyclesByTokenUnreleasedListQueryVariables
>;
