import {useRef} from 'react';
import {AppState} from 'react-native';
import {useAppState} from './useAppState';

export function useInactiveBackgroundState(callback) {
  const appState = useRef(AppState.currentState);

  useAppState(async nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      callback?.();
    }
    appState.current = nextAppState;
    // console.log('AppState', appState.current);
  });
}
