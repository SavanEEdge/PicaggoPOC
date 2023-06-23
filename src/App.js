import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login } from './screens/login';
import { OTP } from './screens/otp';
import { Event } from './screens/event';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useUser } from './hooks/useUser';
import { Loader } from './components/loader';
import { Splash } from './screens/splash';
import auth from '@react-native-firebase/auth';


GoogleSignin.configure({
    webClientId: '896982317636-48kai8erdjk2umhpsa657tak2nce55qn.apps.googleusercontent.com',
});


const { Navigator, Screen } = createNativeStackNavigator();
function NavigationStack() {
    const { user, updateInfo } = useUser();

    useEffect(() => {
        return auth().onAuthStateChanged(user => {
            if (user) {
                user.getIdToken(false)
                    .then(latestToken => {
                        updateInfo({
                            firebaseAuthToken: latestToken,
                            firebaseUser: user,
                        });
                    })
                    .catch(err => {
                        console.log("Firebase Token Error: ", err)
                    });
            }
        })
    }, [])

    return (
        <Navigator>
            {!user.isLoggedIn ?
                <>
                    <Screen name='Splash' component={Splash} options={{ headerShown: false }} />
                    <Screen name='Login' component={Login} options={{ headerShown: false }} />
                    <Screen name='OTP' component={OTP} options={{ headerShown: false }} initialParams={{ resolveSignIn: () => console.log("Moc Function"), verificationId: 'Fake' }} />
                </>
                :
                <Screen name='Event' component={Event} options={{ headerShown: false }} />
            }
        </Navigator>
    );
}



function App() {
    return (
        <Provider store={store}>
            <NavigationContainer>
                <NavigationStack />
                <Loader />
            </NavigationContainer>
        </Provider>
    );
}

export default App;