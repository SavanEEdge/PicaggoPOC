import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useUser } from '../hooks/useUser';

export function Splash({ navigation }) {
    const { user } = useUser();

    useEffect(() => {
        if (user.firebaseAuthToken === '') {
            navigation.replace("login");
        }
    }, []);

    

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