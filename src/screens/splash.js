import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useUser } from '../hooks/useUser';

export function Splash({ navigation }) {
    const { user, updateInfo } = useUser();

    useEffect(() => {
        if (user.firebaseAuthToken === '') {
            navigation.replace("login");
        }
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
                console.log("readyState", this.readyState);
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        const res = JSON.parse(this.response);
                        updateInfo({
                            isLoggedIn: true,
                            user: res,
                        });
                    } else {
                        console.error("API Error:- ", this.responseText);
                        navigation.replace('Login');
                    }
                }
            });
            xhr.open("POST", "https://vq8w0bp7ee.execute-api.us-west-1.amazonaws.com/sign-in");
            xhr.setRequestHeader("Authorization", user.firebaseAuthToken?.trim());
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.send(data);
        }
    }

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="blue" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    }
});