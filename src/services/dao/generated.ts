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
};

/** example: https://docs.graphene-python.org/en/latest/types/mutations/ */
export type CreateDao = {
  __typename?: 'CreateDAO';
  dao?: Maybe<DaoSchema>;
};

export type Dao = {
  __typename?: 'DAO';
  datum?: Maybe<DaoSchema>;
  following?: Maybe<DaoFollowUdSchema>;
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

export type DaoSchema = {
  __typename?: 'DAOSchema';
  createAt: Scalars['Int'];
  desc?: Maybe<Scalars['String']>;
  /** _id */
  id?: Maybe<Scalars['ID']>;
  logo?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  number: Scalars['Int'];
  ownerId: Scalars['String'];
  updateAt: Scalars['Int'];
};

export type DaoStat = {
  __typename?: 'DAOStat';
  following?: Maybe<Scalars['Int']>;
  job?: Maybe<Scalars['Int']>;
  size?: Maybe<Scalars['Float']>;
  token?: Maybe<Scalars['String']>;
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

export type Mutations = {
  __typename?: 'Mutations';
  /** example: https://docs.graphene-python.org/en/latest/types/mutations/ */
  createDao?: Maybe<CreateDao>;
  updateDaoJobConfig?: Maybe<UpdateDaoJobConfig>;
  updateDaoFollow?: Maybe<UpdateDaoFollow>;
  updateDaoBaseInfo?: Maybe<UpdateDaoBaseInfo>;
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
};

export type Query = {
  __typename?: 'Query';
  daos?: Maybe<DaOs>;
  dao?: Maybe<Dao>;
  daoJobConfig?: Maybe<DaoJobConfigSchema>;
  daoGithubAppStatus?: Maybe<DaoGithubAppStatus>;
};

export type QueryDaosArgs = {
  filter?: Maybe<DaOsFilterEnum>;
  sorted?: Maybe<DaOsSortedEnum>;
  sortedType?: Maybe<DaOsSortedTypeEnum>;
  search?: Maybe<Scalars['String']>;
  first?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
};

export type QueryDaoArgs = {
  id: Scalars['String'];
};

export type QueryDaoJobConfigArgs = {
  daoId: Scalars['String'];
};

export type QueryDaoGithubAppStatusArgs = {
  name: Scalars['String'];
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
  jobConfig?: Maybe<DaoJobConfigSchema>;
};

export type UserSchema = {
  __typename?: 'UserSchema';
  avatar: Scalars['String'];
  createAt: Scalars['Int'];
  erc20Address?: Maybe<Scalars['String']>;
  githubLogin: Scalars['String'];
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
    { __typename?: 'UpdateDAOJobConfig' } & {
      jobConfig?: Maybe<
        { __typename?: 'DAOJobConfigSchema' } & Pick<DaoJobConfigSchema, 'updateAt'>
      >;
    }
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

export type DaoGithubAppStatusQueryVariables = Exact<{
  name: Scalars['String'];
}>;

export type DaoGithubAppStatusQuery = { __typename?: 'Query' } & {
  daoGithubAppStatus?: Maybe<
    { __typename?: 'DAOGithubAppStatus' } & Pick<
      DaoGithubAppStatus,
      'githubOrgId' | 'isExists' | 'isGithubOrgOwner' | 'isIcpAppInstalled'
    >
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
      jobConfig {
        updateAt
      }
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
export const DaoGithubAppStatusDocument = gql`
  query DAOGithubAppStatus($name: String!) {
    daoGithubAppStatus(name: $name) {
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
