// @ts-ignore
import { Request, Response } from 'express';

export default {
  'POST /v1/users/icpperships': (req: Request, res: Response) => {
    res
      .status(200)
      .send({
        success: true,
        data: {
          id: 'ED4De7b6-2d8f-bD36-4fCF-fb553beFB9ed',
          progress: 0,
          status: 0,
          mentor_github_login: '光及八强越合步至务切先便品太治毛专酸。',
          icpper: { nickname: '熊霞', github_login: '只次作选方她都斗省共感术党党达。' },
          create_at: 'Jx3p4B',
          pre_icpper_at: 'L%x9A',
          icpper_at: '(CG4yx',
        },
      });
  },
};
