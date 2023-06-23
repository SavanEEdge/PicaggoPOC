import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';

export function Loader() {
    const loader = useSelector(state => state.loader);

    const { isLoading, text } = useMemo(() => loader, [loader]);

    if (!isLoading) return null;

    return (
        <View style={styles.container}>
            <View style={styles.subContainer}>
                <ActivityIndicator size="large" color="blue" />
                <Text style={{ color: 'black' }}>{text}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    subContainer: {
        minHeight: 75,
        minWidth: 75,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 15,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    }
});