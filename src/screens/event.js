import { useEffect } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from "react-native"
import { useEvent } from "../hooks/useEvent";
import { getCameraAssets, requestPermission } from "../utils/helper";
import { useMedia } from '../hooks/useMedia';


function Event() {
    const { event } = useEvent();
    const { media, addAssets } = useMedia();

    useEffect(() => {
        init();
    }, []);

    async function init() {
        const isPermission = await requestPermission();
        if (!!event) {
            const startTime = event?.start_time
            if (isPermission) {
                const result = await getCameraAssets((item) => startTime <= item.timeStamp);
                addAssets(result);
            }
        }
    }
    return (
        <View style={styles.container}>
            {event?.event_id && <Text style={styles.text}>Event Id: {event?.event_id}</Text>}
            {event?.name && <Text style={styles.text}>Event Name: {event?.name}</Text>}
            {event?.start_time && <Text style={styles.text}>Event Start Time: {event?.start_time}</Text>}
            <ScrollView>
                {media.assets.map(media => {
                    if (media.isImage) {
                        return (
                            <Image key={media.uri} source={{ uri: media.uri }} style={{ width: '100%', height: 250 }} />
                        );
                    }
                    return null;
                })}
            </ScrollView>
        </View>
    );

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    text: {
        color: "black",
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: 5,
    }
})

export { Event }