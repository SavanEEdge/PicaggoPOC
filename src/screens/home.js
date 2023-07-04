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
            // create new event
            const headers = {
                "Authorization": user.firebaseAuthToken?.trim()
            }
            const requestBody = {
                user_id: user?.user?.user_id,
                sender_name: user?.user?.name,
                default_upload: true,
                scheduledEndTime: getUnixTimeSteamp(5)?.endTime,
                category: 'Party',
                name: "Test Event"
            };

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
            //         navigation.push("event")
            //     }
            //     hideLoader();
            // } catch (e) {
            //     console.log("AWS fetch error: ", e);
            //     hideLoader();
            // }

            // const server_response = {
            //     "category_id": "96",
            //     "end_time": 1688473054,
            //     "event_id": "1632",
            //     "invite_code": "6a238aa8",
            //     "invite_link": "i.picaggo.com/6a238aa8",
            //     "name": "Test Event",
            //     "qrCode": "data:image/png;base64,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",
            //     "result": "success",
            //     "start_time": 1688041054,
            //     "storageAvailable": false,
            //     "viewer_invite_code": "c140487",
            //     "viewer_invite_link": "i.picaggo.com/c140487",
            //     "viewer_qrCode": "data:image/png;base64,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"
            // }

            const server_response = {
                "category_id": "96",
                "event_id": "1636",
                "invite_code": "650f39ae",
                "invite_link": "i.picaggo.com/650f39ae",
                "name": "Test Event",
                "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADMCAYAAAA/IkzyAAAAAklEQVR4AewaftIAAAuLSURBVO3BQY4cRxIAQffC/P/LvjwGdEhVopsUFwgz+4W11isPa63XHtZarz2stV774R9U/qSKSeVGxYnKjYoTlZOKSWWq+ITKVDGpTBUnKjcqJpWTihsqU8Wk8idVTA9rrdce1lqvPay1XvvhX1R8k8qNihOVv1nFpDJVTConFZPKicqNihOVGyq/U8U3qZw8rLVee1hrvfaw1nrth0sqNyq+SWWq+ITKpHJSMal8QmWqmFQmlaniROWk4kRlqphUpoobKt+kcqPixsNa67WHtdZrD2ut1374y1RMKicqv1PFDZWp4psqJpVPqEwVU8UNlaniRsXf7GGt9drDWuu1h7XWaz/8n6m4oTJVnKhMKn+SyonKVHFDZao4UZkqpopPVPw/eVhrvfaw1nrtYa312g+XKn4nlW+qmFSmipOKGyo3Km6onKhMFScqU8VUcaIyVUwqJxXfVPE7Pay1XntYa732sNZ67Yd/ofJfqphUpopJZar4JpWp4ptUporfqWJSmSomlaliUpkqJpUTlaniROVPelhrvfaw1nrtYa312g//UPE3qzipmFROVKaKb1K5UXFDZaqYVKaKSWWqmFSmiknlRsWkMlWcVPyXHtZarz2stV57WGu99sMllRsVk8pUcaIyVUwqn6j4L6n8ThWTyonKVHFSMalMKlPFiconKk5UblRMD2ut1x7WWq89rLVe++EfVKaKqeITFZPKScWkMlVMKicVJypTxTdVTCo3KiaVE5Wp4obKVDGpnFScVJyoTBUnKicVk8qNh7XWaw9rrdce1lqv2S8cqEwVJypTxaQyVZyofFPFpHKj4ptUpopvUjmpmFSmihsqJxUnKlPFpHKj4obKVDE9rLVee1hrvfaw1nrth0sqn6iYVKaKqWJS+S+pTBWTylRxUjGp/E4Vk8qJylRxo+ITKlPFDZWpYlK58bDWeu1hrfXaw1rrtR/+QWWqOFGZKiaVk4pJ5aTihsqkMlVMKlPFpPI3qbihMlVMKlPFicpUMalMFZPKScWJyknFScWkcvKw1nrtYa312sNa6zX7hQOVqeJPUvlExYnKjYpJ5UbFpDJVnKicVHyTylTxTSpTxaQyVZyoTBWTylRx42Gt9drDWuu1h7XWa/YLg8o3VUwqU8UNlaniRGWqmFSmiknlExUnKlPFDZWp4kTlRsWJylQxqUwVk8pJxaTyJ1VMD2ut1x7WWq89rLVe++EfKk5UbqhMFScqN1SmiqnihspJxaRyojJVfFPFicpJxaRyojJVTConKt9UMalMFZPKJx7WWq89rLVee1hrvWa/cKDyiYpJ5RMVJyo3Kk5UTiomlaliUvmbVEwqn6g4UZkqTlROKk5UpopPPKy1XntYa732sNZ6zX5hULlRcaIyVZyo3Kg4UTmpmFROKj6hclJxQ+WkYlKZKm6oTBUnKjcqTlS+qeLGw1rrtYe11msPa63X7BcuqEwVJyo3Kk5UpopJZar4hMpJxaQyVUwqNyomlRsVN1ROKiaVqeKbVL6pYlI5qZge1lqvPay1XntYa732w79QOVE5qThROVG5UTGpnFTcqJhUblR8ouJEZVKZKk4qJpWTiknlExVTxaRyo+KbHtZarz2stV57WGu99sOliknlhsqJyidUPqEyVUwqN1ROKk5UblRMKpPKVPEJlaliUvmTKk5UpopJ5eRhrfXaw1rrtYe11mv2C4PKVHGicqNiUjmpOFH5popJ5U+qmFROKj6hclLxJ6ncqPiTHtZarz2stV57WGu9Zr9wQWWqmFS+qeJE5aRiUpkqJpWp4obKf6nim1RuVJyo/EkVk8qNiulhrfXaw1rrtYe11ms//GYVN1QmlaliqjhRmSo+oXJScaIyVdxQmSo+oTJVnFRMKicqJxWTylRxQ+Wk4hMPa63XHtZarz2stV774R9UTio+oTJVnFRMKlPFScWkckPlpGJSmSpuqEwVn1CZKqaKT1RMKicVn1CZKk5UblScPKy1XntYa732sNZ67YcPqdyouKFyovKJikllqjhRmSomlRsV31QxqZxUTBU3Kn6nik9UTCqTylQxPay1XntYa732sNZ6zX7hgspUMal8U8WkclIxqdyomFSmihOVP6liUpkqJpWp4kTlExWTyp9UcUNlqpge1lqvPay1XntYa732w6WKSWWqmFSmihOVSeUTFTdUbqjcqJhUTipuVEwqn6iYVKaKE5VvqphUpoobKjce1lqvPay1XntYa732wz+onFTcqJhUblRMKlPF71QxqZxUnKicVJyo3KiYVCaVb1KZKiaVqeJE5aTiROWkYlI5eVhrvfaw1nrtYa312g//omJSuaEyVZyo/E4qU8VUMancUPmEylQxVXyi4kRlqphUJpUTlRsqU8WJyknFpPKJh7XWaw9rrdce1lqv2S9cUJkqbqicVEwqJxWTyo2KSeWk4kTlExWTyknFpHJSMancqPiTVE4qJpVPVJw8rLVee1hrvfaw1nrth39QmSqmikllqjipOFE5qZhUpopJZaqYVL6pYlL5RMUnKiaVqeKGylQxqXxTxYnKScWkMlXceFhrvfaw1nrtYa31mv3CgcpUcUPlRsUNlZOKE5WTihOVqWJSOan4k1R+p4oTlanihspJxaQyVUwqU8XJw1rrtYe11msPa63XfvgylaniROVE5aTiROVGxYnKJyo+oTJVTCpTxVRxojJVTCpTxYnKDZUbFScVk8pUMalMFdPDWuu1h7XWaw9rrdfsF/4glaliUpkqTlSmihOVqeJEZar4nVSmiknlRsWJyo2KSWWq+J1UTiomlRsVJw9rrdce1lqvPay1XrNfGFRuVEwqU8UNlZOKSeWbKiaVT1ScqNyo+ITKScWJyjdVTCo3Km6oTBU3HtZarz2stV57WGu9Zr9woHJScUNlqrihclJxojJVnKicVNxQOamYVG5UfJPKScWkMlVMKjcqJpWTikllqphUpoqTh7XWaw9rrdce1lqv/fAPKjdUblScqJxUfJPK30RlqphUpopJ5RMVU8WkMqmcqJxUnKicVPxJD2ut1x7WWq89rLVes184UJkqbqh8omJSuVExqdyouKEyVUwqNyomlZOKSWWquKEyVZyoTBUnKicVk8pJxSdUporpYa312sNa67WHtdZrP1xSOamYKm6onFRMKn+Syg2Vk4oTlZOKk4oTlanihsonKk5UTipOVKaKSWWqOHlYa732sNZ67WGt9Zr9wqByo+KGyo2KSeVGxYnKVDGpTBUnKlPFpPJNFZPKjYpvUjmpmFR+p4obKlPF9LDWeu1hrfXaw1rrNfuFv4jKf6nim1ROKm6onFTcUJkqJpWpYlI5qbihMlXcUJkqvulhrfXaw1rrtYe11mv2C4PKn1TxTSonFZPKjYoTlaliUpkqJpWpYlKZKiaVk4rfSeWk4kRlqphUpopJ5aRiUjmpmB7WWq89rLVee1hrvfbDv6j4JpUbKjcqJpWTihsqU8U3VdxQOak4UZkqJpVvUvlExY2KGxUnD2ut1x7WWq89rLVe++GSyo2KGypTxScqJpWp4kRlqphUPqHyiYpJ5UbFScUNlW9S+SaVqWJSmSqmh7XWaw9rrdce1lqv/fCXU5kqJpWp4qTiROVE5aRiUrlRcaJyQ+VGxQ2VGxWTylRxojJV3KiYVG48rLVee1hrvfaw1nrth79cxaQyVUwqU8WJylQxqUwVNypOVCaVk4qTiknlpOJE5aRiUpkqJpWpYlL5nVSmiknl5GGt9drDWuu1h7XWaz9cqvidKiaVqeKkYlKZKj6hcqNiUjmpmFROVD6hclJxojJVTConKicVk8qkMlWcVHziYa312sNa67WHtdZrP/wLlb+Zyg2VqWJSuVFxonJSMamcqEwVk8qNihOVk4pJ5UbFpDKpfELlmx7WWq89rLVee1hrvWa/sNZ65WGt9drDWuu1h7XWa/8DiMST8Vk/CKcAAAAASUVORK5CYII=",
                "result": "success",
                "storageAvailable": false,
                "viewer_invite_code": "338b781",
                "viewer_invite_link": "i.picaggo.com/338b781",
                "viewer_qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADMCAYAAAA/IkzyAAAAAklEQVR4AewaftIAAAuoSURBVO3BQY4cRxIAQffC/P/LvjwGeEhVoptcCQgz+4W11isPa63XHtZarz2stV774Tcqf1PFicqNihOVqeKGylRxonKjYlKZKiaVqWJS+UTFicpU8QmVqWJS+Zsqpoe11msPa63XHtZar/3wDyq+SeVE5W9SmSomlROVqWKqOFE5qZhUTlSmikllqphUJpWTiknlb6r4JpWTh7XWaw9rrdce1lqv/XBJ5UbFjYq/qeITFZPKN6lMFScqN1Smij+pYlL5JpUbFTce1lqvPay1XntYa732w7+cyicqpopJZaqYKiaVSWWqmFSmihOVGypTxY2KSeWk4qRiUrlR8W/2sNZ67WGt9drDWuu1H/5jKiaVqeJE5URlqpgqblRMKp9QOVGZKm5UTCqTylTxiYr/koe11msPa63XHtZar/1wqeJPUpkqJpWp4hMVJypTxYnKVHFScUNlqphUPqEyVZyoTBUnKlPFN1X8SQ9rrdce1lqvPay1XvvhH6j8l6hMFTdUpopJZar4JpWp4t9EZaqYVKaKSeVEZao4UfmbHtZarz2stV57WGu9Zr/wL6IyVdxQOan4f1KZKm6onFTcUJkqbqhMFZPKScV/ycNa67WHtdZrD2ut1374MpVPVNxQmSpuqEwVJyonFZPKiconKm6ofELlExUnKlPFpHJScUNlqjh5WGu99rDWeu1hrfXaD5dUpoqTihOVGypTxaRyo+JEZaqYVE4qbqhMFScqU8VJxaRyonJScVJxojJV3KiYVG5UTCpTxfSw1nrtYa312sNa67UffqMyVdyomFQ+oXKiclIxqZyonKhMFZPKVDGpnFRMKjdUPqHyCZWp4qTiRsVJxaQyVXziYa312sNa67WHtdZr9gsHKicVf5PKn1QxqUwVJyonFZPKVDGpfKJiUjmp+CaVk4oTlaliUpkqbqicVEwPa63XHtZarz2stV6zXxhUpopJZaqYVKaKSeWk4hMqU8WJylRxonJS8QmVk4r/J5WpYlI5qThR+aaKE5Wp4uRhrfXaw1rrtYe11mv2C4PKScUNlaniROVGxQ2VGxWTyicqTlRuVEwqNyomlW+q+CaVqWJSmSpuqEwV08Na67WHtdZrD2ut1+wXLqhMFZPKVDGpTBWfUJkqTlSmikllqphUpopJZaqYVKaKGypTxSdUpopJ5UbFDZWp4k9SOak4eVhrvfaw1nrtYa312g+/UbmhMlVMKlPFDZUbKlPFVPFNKicqU8U3qdyoOFG5UfE3qUwVk8qNikllqpge1lqvPay1XntYa732wz+omFQ+oTJVTCpTxaQyVdxQuaFyo2JSOVGZKk4qJpWpYlI5qZhUTipOVKaKSWWquFExqdyomFSmipOHtdZrD2ut1x7WWq/ZL3xAZaq4oTJVTCp/UsWkMlV8QmWqmFROKiaVqeJE5UbFDZW/qeITKlPFjYe11msPa63XHtZar/3wD1Q+oXJDZaqYVG5UnKjcULlRMamcVNxQmSqmiknlEyonFZPKVDGpTBWTyonK3/Sw1nrtYa312sNa67UffqNyUjGpTCpTxQ2VGxWTyqQyVZxUTCrfVHFD5aRiUrlRcaJyUnFDZar4kyomlU88rLVee1hrvfaw1nrth99UTConFZPKico3qUwVNyq+qWJSmSomlRsVn6iYVE4qbqhMFScqU8VUMalMFZPKpHJDZaqYHtZarz2stV57WGu9Zr8wqEwVJyonFScqNypOVP6mihsqJxU3VE4qJpWpYlI5qZhUPlFxovJNFZ94WGu99rDWeu1hrfWa/cKByknFpPJNFZPKVHGi8omKSeXfpOJEZaqYVG5UTCpTxYnKVDGpfFPFNz2stV57WGu99rDWeu2H36jcUDmpuKHyTRWTylQxqUwqJxU3VKaKGyonKlPFpDJVnKicVEwqN1ROKm6onKjcqJge1lqvPay1XntYa732w1+mMlV8k8oNlaliUjlROam4oTJVfELlExWfqJhUpopJ5URlqvhExY2HtdZrD2ut1x7WWq/98JuKSeWbKm6oTBWTylTxTRWTylTxTRU3VKaKGypTxaQyVUwqU8Wk8k0VN1RuqEwV08Na67WHtdZrD2ut1374BxWTyg2VP6niROVGxUnFicoNlU9UnKjcUPmmiknlhsonKiaVTzystV57WGu99rDWes1+4V9EZaqYVKaKT6hMFScqJxWTylRxonKjYlKZKiaVk4pJ5RMVJyonFZPKScWk8omK6WGt9drDWuu1h7XWa/YLg8onKk5UpopJZaqYVP6mihOVk4pJZao4UblRcaLyiYoTlaliUpkqJpWTihOVqeJEZao4eVhrvfaw1nrtYa312g+/qThROVE5qbihMlWcqJxUTConKlPFScVJxScqJpUTlZOKSWWqOFE5UblRcUPlm1SmiulhrfXaw1rrtYe11ms//EZlqpgqbqhMKlPFScWkMlWcVEwqU8UNlROVqWJSOamYKiaVqeKbKk5UPlExqUwVn6g4UTmpOHlYa732sNZ67WGt9Zr9woHKScU3qdyoOFG5UfEJlRsVJypTxaRyUjGpnFRMKicVn1D5RMWJyknFjYe11msPa63XHtZar/3wDyomlRsqJxVTxaRyojJVnFTcUDmpmComlROVqeITFZPKVDGpTConFScqU8WkMlVMKicVk8qNihOVqWJ6WGu99rDWeu1hrfWa/cKgMlX8SSpTxQ2VqWJSmSpuqJxU3FD5pooTlZOKSWWqOFH5RMX/k8pJxfSw1nrtYa312sNa6zX7hUFlqphUpopJ5RMVk8pUcaLyiYoTlU9UnKh8U8WkMlXcUDmpmFSmiknlpGJSmSomlaliUjmpOHlYa732sNZ67WGt9Zr9wgdUTipuqPxJFZPKScWk8omKE5Wp4obKjYoTlRsV36QyVUwqn6i48bDWeu1hrfXaw1rrNfuFL1L5RMWkMlVMKp+o+ITKVHGiMlXcUJkqTlSmihsqU8WkMlWcqEwVk8pJxaRyo+JEZaqYHtZarz2stV57WGu9Zr9wQeWk4obKVHGicqPim1T+pIoTlaliUvlExTep3Kj4JpWTikllqpge1lqvPay1XntYa732wz9QmSpuqJxUnKjcqLihMlWcVJyonFT8P1VMKpPKVDGpTBWTyknFpHJDZaqYVE4qJpWp4uRhrfXaw1rrtYe11mv2CwcqNyo+oXJScaJyo2JSOak4UblRcaLyiYpJZar4hMpUMamcVEwqJxWTyknFicpUcfKw1nrtYa312sNa67UffqNyo+KGyknFDZWpYlI5UZkqbqicVEwqk8rfVPEJlU9UfELlmyomlalielhrvfaw1nrtYa31mv3Cv4jKScUNlaniRGWqOFH5RMUNlaliUpkqTlSmiknlpOITKicVN1ROKj7xsNZ67WGt9drDWuu1H36j8jdV/EkVJypTxYnKVDGpTBWTyonKVHGiMlVMKlPFiconVKaKk4pJ5URlqrihMlXceFhrvfaw1nrtYa312g//oOKbVG5UTCpTxQ2Vb1I5UblRcaNiUpkqTipOVKaKSWWqmFS+qeJGxaRyojJVTA9rrdce1lqvPay1XvvhksqNik+oTBU3VG6oTBU3KiaVE5VvqphUTir+pIobKpPKJ1S+6WGt9drDWuu1h7XWaz/8y1RMKicqU8VJxScqJpVJZaqYVKaKSeWkYlKZKk4qJpWp4kbFDZWTikllqphUblRMKjce1lqvPay1XntYa732w79cxaRyo2JSmSomlRsVNyomlaniROVE5UTlROUTKlPFDZUTlRsVNypOHtZarz2stV57WGu99sOlir9J5YbKVDFVnFR8k8pUMVWcqEwVJyqfqJhUJpWp4kTlpGJSmSomlaliUjlR+cTDWuu1h7XWaw9rrdd++Acq/yUVk8pJxaQyVUwqNypOVD6hMlXcUJlUpopJ5UbFjYpPVHxCZaqYHtZarz2stV57WGu9Zr+w1nrlYa312sNa67WHtdZr/wP8PaMDfo7biwAAAABJRU5ErkJggg=="
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