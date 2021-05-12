// @ts-ignore
import { Request, Response } from 'express';

export default {
  'GET /v1/users/github/auth_callback': (req: Request, res: Response) => {
    res.status(200).send({ success: true, data: { jwt: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJ1c2VyX2lkIjoiNjA5YWNlMjJkNTY5NDNlOGY3YmJhNDBmIiwiZXhwIjoxNjIwODY4NDMwfQ.qL45K0R6VTcAskawJVAPTo40MuvXe--4Qd2zYsFaGfm023JYjV2L96-h-Tiv4uZtufqr2nfi-mgZjmLGbNycs9eXY4fcpBcsA2duziViboFJxbwqpMin34hAx4qwDEwQavtNztt0N4yGpdRgbT5KGmTAF2cJia8B16SLKmXbR6S5mU0x11i8tHNagYY-a30hcmaAX5rOp-T6YTUd-Tlt11rKcUaVxy_-tU4dn8gF8N2Wxa10L4hmfzlfNZ1Ld-AtJlaB63oxwpoJwAYzlDv6ngQfcJ6x7ua46oXwbDb_37ptwOq82vPdc6GtkbMjim7p07afuCJEy34iIhUqeHbmVw' } });
  },
};
