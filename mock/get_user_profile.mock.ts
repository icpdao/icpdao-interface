// @ts-ignore
import { Request, Response } from 'express';

export default {
  'GET /v1/users/profile': (req: Request, res: Response) => {
    res
      .status(200)
      .send({
        success: true,
        data: {
          nickname: '杨洋',
          avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
          github_login: '里区每看过值都系共然我外六。',
          status: 2,
          icppership: {
            id: '66FBbCFC-fEDc-Fb55-bEfD-A5fa8abb56f2',
            progress: 0,
            status: 0,
            mentor: {
              nickname: '侯刚',
              github_login: '别么在快准物计较空百装己门。',
              avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
              number_of_instructors: 97,
            },
          },
          erc20_address: '大史至位风酸军效历石酸即但国直军。',
        },
      });
  },
};
