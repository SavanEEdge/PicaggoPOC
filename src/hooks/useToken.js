import { useState, useEffect } from 'react'
import auth from '@react-native-firebase/auth';

export default function useToken() {
    const [token, setToken] = useState('')
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
        return auth().onAuthStateChanged(user => {
            if (user) {
                user.getIdToken(false)
                    .then(latestToken => {
                        setToken(latestToken)
                        setLoading(false);
                    })
                    .catch(err => {
                        console.log(err)
                        setLoading(false);
                    })
            } else {
                setLoading(false);
            }
        })
    }, [])

    async function Logout() {
        await auth().signOut();
        setToken('');
    }

    return {token, loading, Logout}
}