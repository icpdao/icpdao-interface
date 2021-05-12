import { useIntl } from 'umi';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: 'icpdao',
  });
  const date = new Date();
  return (
    <DefaultFooter
      copyright={`${date.getFullYear()} ${defaultMessage}`}
      links={[]}
    />
  );
};
