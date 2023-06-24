import React from 'react';
import { StyleSheet, View } from 'react-native';
import { GoogleSignin, GoogleSigninButton, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useLoader } from '../hooks/useLoader';
import { useUser } from '../hooks/useUser';


function Login({ navigation }) {

    const { showLoader, hideLoader } = useLoader();
    const { updateInfo } = useUser();

    async function signin() {
        try {
            showLoader('Google Sign in...');
            await GoogleSignin.hasPlayServices();
            const googleUser = await GoogleSignin.signIn();
            const { idToken } = googleUser;
            updateInfo({
                googleToken: idToken,
                googleUser,
            })
            console.log("idToken", idToken)

            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);

            showLoader('Firebase Sign in...');
            // Sign-in the user with the credential
            await auth().signInWithCredential(googleCredential);
        } catch (error) {
            hideLoader();
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
                console.log("Sign In cancelled...")
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
                console.log("Sign In In Progress...")
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                console.log("Google Play Services are not available...")
            } else if (error.code === 'auth/multi-factor-auth-required') {

                const resolver = auth().getMultiFactorResolver(error);
                if (resolver.hints[0].factorId === auth.PhoneMultiFactorGenerator.FACTOR_ID) {
                    const hint = resolver.hints[0];
                    const sessionId = resolver.session;
                    showLoader('MFA Auth...');
                    auth()
                        .verifyPhoneNumberWithMultiFactorInfo(hint, sessionId)
                        .then(verificationId => {
                            hideLoader();
                            updateInfo({
                                verificationId,
                                resolver,
                            })
                            navigation.replace("OTP")
                        })
                        .catch(err => {
                            hideLoader();
                            console.error("VErification Error: ", JSON.stringify(err, null, 2))
                        });
                }

            } else {
                console.log("Google Sign In Error: ", JSON.stringify(error));
            }
        }
    }

    return (
        <View style={styles.container}>
            <GoogleSigninButton
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={signin}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})

export { Login }