import { useEventEmitter } from 'ahooks';

export default () => {
  const event$ = useEventEmitter();

  return {
    event$,
  };
};
