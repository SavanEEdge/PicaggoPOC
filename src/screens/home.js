import React, { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from '../hooks/useUser';
import { encodedData, generateFileName, getHash, getMD5, getUnixTimeSteamp, parseJson } from '../utils/helper';
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
            //     if (response.status) {
            //         const server_response = parseJson(response.data);
            //         console.log("Response", server_response);
            //         const event_obj = { ...server_response, start_time: getUnixTimeSteamp(5)?.startTime, end_time: getUnixTimeSteamp(5)?.endTime };
            //         console.log("event_obj", event_obj);
            //         addEvent(event_obj);
            //         StorageService.setValue("event_details", event_obj);
            //         hideLoader();
            //         navigation.push("event")
            //     }
            //     hideLoader();
            // } catch (e) {
            //     console.log("AWS fetch error: ", e);
            //     hideLoader();
            // }

            // const server_response = {
            //     "name": "Test Event",
            //     "category_id": "96",
            //     "storageAvailable": false,
            //     "event_id": "1625",
            //     "qrCode": "data:image/png;base64,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",
            //     "viewer_qrCode": "data:image/png;base64,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",
            //     "invite_link": "i.picaggo.com/5183009b",
            //     "invite_code": "5183009b",
            //     "viewer_invite_link": "i.picaggo.com/37b48eb4",
            //     "viewer_invite_code": "37b48eb4",
            //     "result": "success"
            // }

            const server_response = {
                "category_id": "96",
                "end_time": 1688473054,
                "event_id": "1632",
                "invite_code": "6a238aa8",
                "invite_link": "i.picaggo.com/6a238aa8",
                "name": "Test Event",
                "qrCode": "data:image/png;base64,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",
                "result": "success",
                "start_time": 1688041054,
                "storageAvailable": false,
                "viewer_invite_code": "c140487",
                "viewer_invite_link": "i.picaggo.com/c140487",
                "viewer_qrCode": "data:image/png;base64,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"
            }
            const event_obj = { ...server_response, start_time: 1687793865, end_time: 1688225313 };
            addEvent(event_obj);
            StorageService.setValue("event_details", event_obj);
            navigation.push("event")
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