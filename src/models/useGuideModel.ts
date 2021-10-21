import { useEventEmitter } from 'ahooks';

export default () => {
  const openGuideEvent = useEventEmitter();
  const closeGuideEvent = useEventEmitter();
  return { openGuideEvent, closeGuideEvent };
};
