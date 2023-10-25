import {useCallback} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {insertMedia} from '../redux/slices/media';

export function useMedia() {
  const dispatch = useDispatch();
  const mediaData = useSelector(state => state.media);

  const addAssets = useCallback(
    mediaArray => {
      dispatch(insertMedia(mediaArray));
    },
    [dispatch],
  );

  return {
    media: mediaData,
    addAssets,
  };
}
