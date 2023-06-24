import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addEventDetails } from '../redux/slices/event';

export function useEvent() {
    const dispatch = useDispatch();
    const eventData = useSelector(state => state.event);

    function addEvent(obj) {
        dispatch(addEventDetails(obj));
    }

    return {
        event: useMemo(() => eventData, [eventData]),
        addEvent
    }
}