import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMediaDetails } from '../redux/slices/media';

export function useMedia() {
    const dispatch = useDispatch();
    const mediaData = useSelector(state => state.media);

    function addAssets(mediaArray) {
        dispatch(addMediaDetails(mediaArray));
    }

    return {
        media: useMemo(() => mediaData, [mediaData]),
        addAssets
    }
}