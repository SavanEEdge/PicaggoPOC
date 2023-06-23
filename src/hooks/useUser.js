import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateInformation } from '../redux/slices/user';

export function useUser() {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.user);

    function updateInfo(obj) {
        dispatch(updateInformation(obj));
    }

    function userLogout() {
        dispatch(logout());
    }

    return {
        user: useMemo(() => userData, [userData]),
        updateInfo,
        userLogout
    }
}