import { useDispatch } from 'react-redux';
import { toggleLoader } from '../redux/slices/loader';

export function useLoader() {
    const dispatch = useDispatch();

    function showLoader(text = '') {
        dispatch(toggleLoader({
            isLoading: true,
            text,
        }));
    }
    function hideLoader() {
        dispatch(toggleLoader({
            isLoading: false,
            text: '',
        }));
    }

    return { showLoader, hideLoader };
}