// @ts-ignore
import { Request, Response } from 'express';

export default {
  'DELETE /v1/users/icpperships/{id}': (req: Request, res: Response) => {
    res.status(200).send({ success: true, data: {} });
  },
};
