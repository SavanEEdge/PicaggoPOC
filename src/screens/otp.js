import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import OTPTextInput from 'react-native-otp-textinput';
import auth from '@react-native-firebase/auth';
import { useLoader } from '../hooks/useLoader';
import { useUser } from '../hooks/useUser';

function OTP({ route }) {
    const { user } = useUser();
    const { showLoader, hideLoader } = useLoader();
    const [otp, setotp] = useState('');
    const { verificationId, resolver } = user;

    async function verifyOTP() {
        showLoader('Verifying OTP...')
        const credential = auth.PhoneAuthProvider.credential(verificationId, otp);

        const multiFactorAssertion = auth.PhoneMultiFactorGenerator.assertion(credential);

        resolver.resolveSignIn(multiFactorAssertion).then(userCredential => {
            // additionally onAuthStateChanged will be triggered as well
            hideLoader();
            console.log("userCredential", userCredential)
        }).catch(err => {
            hideLoader();
            console.log("Errr", err)
        });
    }

    return (
        <View style={styles.container}>
            <OTPTextInput inputCount={6} autoFocus handleTextChange={setotp} />
            <Button title='Verfiy' onPress={verifyOTP} />
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

export { OTP }