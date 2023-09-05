import {useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {insertMedia} from '../redux/slices/media';
import {useEffect} from 'react';

export function useMedia() {
  const dispatch = useDispatch();
  const mediaData = useSelector(state => state.media);

  function addAssets(mediaArray) {
    dispatch(insertMedia(mediaArray));
  }

  return {
    media: mediaData,
    addAssets,
  };
}
