// @ts-ignore
import { Request, Response } from 'express';

export default {
  'GET /v1/users/icpperships': (req: Request, res: Response) => {
    res.status(200).send({
      success: true,
      data: [
        {
          id: 'cF3CA132-a95d-29Bb-De7A-CaAe1fe41ddd',
          progress: 0,
          status: 0,
          mentor_github_login: '日西实育计厂长变成研线变代里候。',
          icpper: { nickname: '孙秀兰', github_login: '空光切' },
          create_at: 1620757605,
          pre_icpper_at: 'E8N^7',
          icpper_at: 'tq[',
        },
        {
          id: '8c30e5fF-cdCf-B3cD-08fE-FbD8cEBBEb2c',
          progress: 0,
          status: 0,
          mentor_github_login: '题快到使间越委但些料本和回将图积。',
          icpper: { nickname: '毛明', github_login: '业书边' },
          create_at: 1620790605,
          pre_icpper_at: 'obT#!',
          icpper_at: '$5GFyr',
        },
        {
          id: 'D830edeE-16Ac-d1b1-9156-30d0C52957E6',
          progress: 1,
          status: 0,
          mentor_github_login: '立边称还其样头证保六九数二样并照其。',
          icpper: { nickname: '黄芳', github_login: '能志林交' },
          create_at: 1620797005,
          pre_icpper_at: 'knID',
          icpper_at: '4Uk2##',
        },
        {
          id: 'cE661c6f-1334-6Bc8-8BCc-CEFfECBC48E9',
          progress: 1,
          status: 0,
          mentor_github_login: '据须子难这际少经毛很头至比北构特准。',
          icpper: { nickname: '杜静', github_login: '给合酸' },
          create_at: 1620796605,
          pre_icpper_at: 'REY5m',
          icpper_at: 'H5cf^',
        },
      ],
    });
  },
};
