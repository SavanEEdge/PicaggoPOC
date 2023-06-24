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
        if (user?.user?.user_id !== '') {
            // console.log("user?.user?.user_id", user?.user?.user_id, user?.user?.user_id !== '')
            fetchS3Details();
        }
    }, [user.user]);

    function login() {
        const data = "version=1.0&device_name=Vivo%20v15&device=android";
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            showLoader("Server login...");
            // console.log("readyState", this.readyState);
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

    function fetchS3Details() {
        const data = `user_id=${user?.user?.user_id}&region=india`;
        const xhr = new XMLHttpRequest();
        xhr.withCredentials = true;

        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    addS3Details(JSON.parse(this.response));
                }
            }
        });

        // console.log("========================================================")
        // console.log("data", data)
        // console.log("========================================================")
        xhr.open("POST", "https://u6mj6kk2h1.execute-api.us-west-1.amazonaws.com/findRegion");
        xhr.setRequestHeader("Authorization", user.firebaseAuthToken?.trim());
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
    };


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