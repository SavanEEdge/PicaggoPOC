import React, { useEffect } from 'react';
import { Text, View, Button } from 'react-native';
import useToken from '../hooks/useToken';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { HttpClient } from '../helper/api';
import { useUser } from '../hooks/useUser';

function Event({ navigation }) {
    const { user, userLogout } = useUser();
    useEffect(() => {
        console.log("user", JSON.stringify(user, null, 2))
    }, [])


    async function onLogout() {
        await auth().signOut();
        userLogout();
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: "black" }}>{user?.user?.user_id}</Text>
            <Button title='Logout' onPress={onLogout} />
        </View>
    );
}

export { Event }