import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
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
import auth from '@react-native-firebase/auth';
import { useLoader } from './hooks/useLoader';


GoogleSignin.configure({
    webClientId: '896982317636-48kai8erdjk2umhpsa657tak2nce55qn.apps.googleusercontent.com',
});


const { Navigator, Screen } = createNativeStackNavigator();
function NavigationStack() {
    const [initializing, setInitializing] = useState(true);
    const { user, updateInfo, userLogout } = useUser();
    const { showLoader, hideLoader } = useLoader();

    // Check Firebase auth state
    function authStateChanged(user) {
        if (user) {
            user.getIdToken(false)
                .then(latestToken => {
                    updateInfo({
                        firebaseAuthToken: latestToken,
                        firebaseUser: user,
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
        login();
    }, [user.firebaseAuthToken]);

    function login() {
        if (user.firebaseAuthToken !== '') {
            const data = "version=1.0&device_name=Vivo%20v15&device=android";
            const xhr = new XMLHttpRequest();
            xhr.withCredentials = true;
            
            xhr.addEventListener("readystatechange", function () {
                showLoader("Server login...");
                console.log("readyState", this.readyState);
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        const res = JSON.parse(this.response);
                        updateInfo({
                            isLoggedIn: true,
                            user: res,
                        });
                        setInitializing(false);
                        hideLoader();
                    } else {
                        console.error("API Error:- ", this.responseText);
                        setInitializing(false);
                        hideLoader();
                        userLogout();
                    }
                }
            });
            xhr.open("POST", "https://vq8w0bp7ee.execute-api.us-west-1.amazonaws.com/sign-in");
            xhr.setRequestHeader("Authorization", user.firebaseAuthToken?.trim());
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
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