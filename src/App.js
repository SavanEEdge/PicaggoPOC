import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Login } from './screens/login';
import { OTP } from './screens/otp';
import { Home } from './screens/home';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { useUser } from './hooks/useUser';
import { Loader } from './components/loader';
import auth from '@react-native-firebase/auth';
import { useLoader } from './hooks/useLoader';
import { useAWS } from './hooks/useAWS';
import { Event } from './screens/event';
import api from './api';
import { parseJson } from './utils/helper';


GoogleSignin.configure({
    webClientId: '896982317636-48kai8erdjk2umhpsa657tak2nce55qn.apps.googleusercontent.com',
});


const { Navigator, Screen } = createNativeStackNavigator();
function NavigationStack() {
    const [initializing, setInitializing] = useState(true);
    const { user, updateInfo, userLogout } = useUser();
    const { showLoader, hideLoader } = useLoader();
    const { addS3Details } = useAWS();

    // Check Firebase auth state
    function authStateChanged(user) {
        if (user) {
            user.getIdToken(true)
                .then(latestToken => {
                    console.log("Token", latestToken)
                    updateInfo({
                        firebaseAuthToken: latestToken,
                        firebaseUser: JSON.stringify(user),
                    });
                })
                .catch(err => {
                    console.log("Firebase Token Error: ", err);
                });
        } else {
            userLogout();
            setInitializing(false);
        }
    };

    useEffect(() => {
        return auth().onAuthStateChanged(authStateChanged);
    }, []);

    useEffect(() => {
        if (user.firebaseAuthToken !== '') {
            login();
        }
    }, [user.firebaseAuthToken]);

    useEffect(() => {
        if (user?.user?.user_id && user?.user?.user_id !== '') {
            fetchS3Details();
        }
    }, [user.user]);

    async function login() {
        const headers = {
            "Authorization": user.firebaseAuthToken?.trim()
        }
        const requestBody = {
            version: 1,
            device_name: 'vivo',
            device: 'android',
        };

        try {
            showLoader("Server login...");
            const response = await api.post("https://vq8w0bp7ee.execute-api.us-west-1.amazonaws.com/sign-in", requestBody, headers);
            if (response.status) {
                const data = parseJson(response.data);
                // console.log("Login Response: ", data);
                updateInfo({
                    isLoggedIn: true,
                    user: data,
                });
            }
            hideLoader();
            setInitializing(false);
        } catch (e) {
            console.log("Login error: ", e);
            hideLoader();
            userLogout();
            setInitializing(false);
        }
    }

    async function fetchS3Details() {
        const headers = {
            "Authorization": user.firebaseAuthToken?.trim()
        }
        const requestBody = {
            user_id: user?.user?.user_id,
            region: 'india'
        };

        try {
            const response = await api.post("https://u6mj6kk2h1.execute-api.us-west-1.amazonaws.com/findRegion", requestBody, headers);
            if (response.status) {
                const data = parseJson(response.data);
                addS3Details(data);
            }
        } catch (e) {
            console.log("AWS fetch error: ", e);
        }
    };

    if (__DEV__) {
        import('./utils/ReactotronConfig').then(() => console.log('Reactotron Configured'))
    }

    if (initializing) {
        return <ActivityIndicator />;
    }

    return (
        <Navigator>
            {!user.isLoggedIn ?
                <>
                    <Screen name='Login' component={Login} options={{ headerShown: false }} />
                    <Screen name='OTP' component={OTP} options={{ headerShown: false }} />
                </>
                :
                <>
                    <Screen name='home' component={Home} options={{ headerShown: false }} />
                    <Screen name='event' component={Event} options={{ headerShown: false }} />
                </>
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