import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addDetails } from '../redux/slices/aws';

export function useAWS() {
    const dispatch = useDispatch();
    const awsData = useSelector(state => state.aws);

    function addS3Details(obj) {
        dispatch(addDetails(obj));
    }

    return {
        awsDetails: useMemo(() => awsData, [awsData]),
        addS3Details
    }
}