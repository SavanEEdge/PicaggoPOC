import { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { logout, updateInformation } from '../redux/slices/user';

export function useUser() {
    const dispatch = useDispatch();
    const userData = useSelector(state => state.user);

    function updateInfo(obj) {
        dispatch(updateInformation(obj));
    }

    async function userLogout() {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
            await GoogleSignin.revokeAccess();
            await GoogleSignin.signOut();
            auth().signOut();
        }
        dispatch(logout());
    }

    return {
        user: useMemo(() => userData, [userData]),
        updateInfo,
        userLogout
    }
}