// @ts-ignore
import { Request, Response } from 'express';

export default {
  'PUT /v1/users/icpperships/{id}/accept': (req: Request, res: Response) => {
    res
      .status(200)
      .send({
        success: true,
        data: {
          id: '67FCAdCA-0178-A570-8e48-FF6040fFf356',
          progress: 0,
          status: 0,
          mentor_github_login: '下别人作料信回以身最也极者属广况。',
          icpper: { nickname: '薛杰', github_login: '选重等处没除山保金于极团生图存算。' },
          create_at: 'M$X#v^',
          pre_icpper_at: 'bap',
          icpper_at: 'E9lLQ',
        },
      });
  },
};
