import React, { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from '../hooks/useUser';
import { encodedData, generateFileName, getHash, getMD5, getUnixTimeSteamp, parseJson, requestPermission } from '../utils/helper';
import { useLoader } from '../hooks/useLoader';
import { useEvent } from '../hooks/useEvent';
import { StorageService } from '../service/storage_service';
import api from '../api';

function Home({ navigation }) {

    const { user, userLogout } = useUser();
    const { addEvent } = useEvent();
    const { showLoader, hideLoader } = useLoader();

    async function onLogout() {
        await auth().signOut();
        userLogout();
    }

    async function createEvent() {
        const event = StorageService.getValue("event_details");
        if (!!event) {
            // Event is running
            // reactotron.log("Event", event);
            addEvent(event);
            navigation.push("event")
        } else {
            // // create new event
            // const headers = {
            //     "Authorization": user.firebaseAuthToken?.trim()
            // }
            // const requestBody = {
            //     user_id: user?.user?.user_id,
            //     sender_name: user?.user?.name,
            //     default_upload: true,
            //     scheduledEndTime: getUnixTimeSteamp(5)?.endTime,
            //     category: 'Party',
            //     name: "Test Event"
            // };

            // try {
            //     showLoader('Creating Event...')
            //     const response = await api.post("https://icfzx3vc69.execute-api.us-west-1.amazonaws.com/create_event", requestBody, headers);
            //     const timing = getUnixTimeSteamp(5);
            //     if (response.status) {
            //         const server_response = parseJson(response.data);
            //         console.log("Response", server_response);
            //         const event_obj = { ...server_response, start_time: timing?.startTime, end_time: timing?.endTime };
            //         console.log("event_obj", event_obj);
            //         addEvent(event_obj);
            //         StorageService.setValue("event_details", event_obj);
            //         hideLoader();
            //         const isPermission = await requestPermission();
            //         if (isPermission) {
            //             navigation.push("event")
            //         }
            //     }
            //     hideLoader();
            // } catch (e) {
            //     console.log("AWS fetch error: ", e);
            //     hideLoader();
            // }

            const server_response = {
                "name": "Test Event2",
                "category_id": "96",
                "storageAvailable": false,
                "event_id": "1644",
                "qrCode": "data:image/png;base64,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FScqJxVPqEwVJypTxaQyVUwqJxUnF2ut2y7WWrddrLVu+/BlFU+oTConFZPKVDGpnFT8pIoTlaliUpkqJpWTiknlROWkYlJ5QuVvUpkq3rhYa912sda67WKtdduHP6iYVN5QOamYVCaV/yUq36QyVUwqk8pUMam8UfFExRMq36RyUnFysda67WKtddvFWus2+4UHVKaKSeWk4ptUvqniROWJikllqphUpopJ5Y2KE5U3KiaVqeJE5Y2KSeWNiulirXXbxVrrtou11m32C4PKVHGiMlVMKicVJypPVEwqU8UbKlPFN6mcVEwqT1ScqEwVJyo/qeKbVJ6omC7WWrddrLVuu1hr3fbhNxWTylQxVTxRMalMFU9UPKFyUvGEylQxqUwVJxUnKlPFpPKTVKaKE5WTikllUjmpeKNiUjm5WGvddrHWuu1irXXbh9+oTBWTyknFicpU8UTFicpUcaLyRsWk8oTKVHFS8UTFicpUcVJxojJVTCqTylQxqUwVk8pJxTddrLVuu1hr3Xax1rrtw28qflLFpHJSMamcVJyoTBWTyknFGyrfpDJVTCpTxVRxojJVTCpTxX+pYlKZKt64WGvddrHWuu1irXXbhz9QOak4qZhUpop/ScWkMqlMFVPFicoTKk+oTBWTylTxhMpUMalMFU+oTBWTyjepTBUnF2ut2y7WWrddrLVus184UJkqTlSmip+kclLxhMpU8YTKExU/SWWqmFTeqDhRmSomlaniDZWp4gmVqWK6WGvddrHWuu1irXXbhy+rmFROKiaVk4qTiknlpGKqOFF5o2JSmSomlW9SOak4Ufmmim+qmFROKqaKk4u11m0Xa63bLtZat314SOWkYqp4o+IJlaliUplUTiq+SWWqeKNiUpkqTlROVKaKSeWk4g2Vk4onKt64WGvddrHWuu1irXXbh9+oPFHxhMoTKicVb1S8UfGEyqTyhsobFZPKGxWTyknFpPKEyt90sda67WKtddvFWuu2D7+p+EkVJypTxYnKVPGGylRxojJVPFHxhMpUMamcqEwVU8WJyhsVk8pJxRMqJypTxaQyVUwXa63bLtZat12stW778BuVv6nijYpJZao4UTlRmSpOVN5QmSpOVKaKSWWqeKPiROWJiknlRGWqeKJiUnniYq1128Va67aLtdZtH/6g4ptUTiomlanijYpJZao4UZkqpooTlZOKJyomlROVJyomlaliqphUvqnimyomlZOLtdZtF2ut2y7WWrd9eEjliYo3KiaVqeKbVN5QeULlDZWp4kTlpGJSeaNiUpkqTlT+poqTi7XWbRdrrdsu1lq3ffjHqDyhMlVMKicVk8pUMalMKlPFpDJVTCpTxYnKVDGpfFPFicoTFZPKVHGiMlW8oXJSMV2stW67WGvddrHWuu3DP67iROWJipOKJyomlaliUpkqJpWTikllqnhDZaqYVE4q3lCZKqaKE5U3Kk4u1lq3Xay1brtYa9324aGKn1RxojJVTCpvqHyTyhsVk8pUcaIyVTyhclIxqUwVk8pU8YbKGxVPXKy1brtYa912sda67cMfqPxLKr5J5YmKNyomlScqTlROVKaKqeJEZVI5UXlC5Y2KSeVE5aRiulhr3Xax1rrtYq11m/3CWuuWi7XWbRdrrdsu1lq3/R9sTLnmFtMCKwAAAABJRU5ErkJggg==",
                "viewer_qrCode": "data:image/png;base64,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",
                "invite_link": "i.picaggo.com/a02760cf",
                "invite_code": "a02760cf",
                "viewer_invite_link": "i.picaggo.com/b906a18",
                "viewer_invite_code": "b906a18",
                "result": "success"
            }
            const event_obj = { ...server_response, start_time: 1687793865, end_time: 1688225313 };
            addEvent(event_obj);
            StorageService.setValue("event_details", event_obj);
            if (isPermission) {
                navigation.push("event")
            }
        }

    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}>User Id: {user?.user?.user_id}</Text>
            <Text style={styles.text}>User Name: {user?.user?.name}</Text>
            <Button title='Create Event(5 Days default)' onPress={createEvent} />
            <Button title='Logout' onPress={onLogout} />
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

export { Home }