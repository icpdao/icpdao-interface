# icpdao-interface
icpdao app frontend

# dev
1. need nodejs and yarn
2. config .env by .env.sample
3. yarn start

# deploy to aws
1. install aws-cli and config by https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html
2. install serverless cli and config by https://www.serverless.com/framework/docs/getting-started/
3. add .env
4. deploy
```
sls deploy --stage dev
sls deploy --stage prod
```
