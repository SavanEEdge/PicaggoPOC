import React, { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from '../hooks/useUser';
import { encodedData, generateFileName, getHash, getMD5, getUnixTimeSteamp } from '../utils/helper';
import { useLoader } from '../hooks/useLoader';
import { useEvent } from '../hooks/useEvent';
import { StorageService } from '../service/storage_service';

function Home({ navigation }) {

    const { user, userLogout } = useUser();
    const { addEvent } = useEvent();
    const { showLoader, hideLoader } = useLoader();

    useEffect(() => {
        getMD5('20230627_184850.jpg');
    }, [])

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
            // const rawData = {
            //     user_id: user?.user?.user_id,
            //     sender_name: user?.user?.name,
            //     default_upload: true,
            //     scheduledEndTime: getUnixTimeSteamp(5)?.endTime,
            //     category: 'Party',
            //     name: "Test Event"
            // }
            // const data = encodedData(rawData);
            // showLoader('Creating Event...')
            // const xhr = new XMLHttpRequest();
            // xhr.withCredentials = true;
            // xhr.open("POST", "https://icfzx3vc69.execute-api.us-west-1.amazonaws.com/create_event");
            // xhr.setRequestHeader("Authorization", user.firebaseAuthToken?.trim());
            // xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            // xhr.send(data);

            // xhr.addEventListener("readystatechange", function () {
            //     if (this.readyState === 4) {
            //         if (this.status === 200) {
            //             const server_response = JSON.parse(this.response);
            //             console.log("Response", server_response);
            //             const event_obj = { ...server_response, start_time: getUnixTimeSteamp(5)?.startTime, end_time: getUnixTimeSteamp(5)?.endTime };
            //             addEvent(event_obj);
            //             StorageService.setValue("event_details", event_obj);
            //             hideLoader();
            //             navigation.push("event")
            //         } else {
            //             console.log(JSON.stringify(this.response, null, 2));
            //             hideLoader();
            //         }
            //     }
            // });

            // const server_response = {
            //     "category_id": "96",
            //     "event_id": "1622",
            //     "invite_code": "e51a442d",
            //     "invite_link": "i.picaggo.com/e51a442d",
            //     "name": "Test Event",
            //     "qrCode": "data:image/png;base64,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KicVk8pUMamcVJyonFS8oTJVTCpTxaRyUjGpnKicVEwqT6j8JpWp4o2LtdZtF2ut2y7WWrd9+A8Vk8obKicVk8qkcqLyhMpU8YTKb1KZKiaVSWWqmFTeqHii4gmVb1I5qTi5WGvddrHWuu1irXWb/cEDKlPFicpU8ZtU3qiYVJ6omFSmikllqphUnqh4QuWNikllqjhReaNiUnmjYrpYa912sda67WKtdZv9waAyVZyonFRMKlPFicoTFZPKVPGGylTxTSonFZPKExUnKlPFicpPqvgmlScqpou11m0Xa63bLtZat334S8WkMlVMFU9UTCpTxRMVT6icVDyhMlVMKlPFScWJylQxqfwklaniROWkYlKZVE4q3qiYVE4u1lq3Xay1brtYa9324S8qU8WkclJxojJVPFFxojJVnKi8UTGpPKEyVZxUfJPKVHFScaIyVUwqk8pUMalMFZPKScU3Xay1brtYa912sda67cNfKn5SxaRyUjGpnFScqEwVk8pJxRsq36RyUnFScaIyVUwqU8X/UsWkMlW8cbHWuu1irXXbxVrrtg//QeWk4gmVqeJfUjGpTCpTxVRxovKEyhMVJypTxRMqU8WkMlU8oTJVTCrfpDJVnFystW67WGvddrHWus3+4EBlqjhRmSp+kspJxRMqU8UTKk9U/C+pvFFxojJVTCpTxRsqU8UTKlPFdLHWuu1irXXbxVrrtg9fVjGpnFRMKicVJxWTyknFVHGi8kbFpDJVTCq/qeJE5ZsqvqliUjmpmCpOLtZat12stW67WGvd9uEhlZOKqeKNiidUpopJZVI5qXijYlKZKn5SxYnKicpUMamcVLyhclLxRMWJylQxXay1brtYa912sda67cNfVJ6oeELlpGJSOal4o+KNijdU/pcqJpU3KiaVk4pJ5QmVb6o4uVhr3Xax1rrtYq1124e/VPykihOVqeJEZap4Q2WqOFGZKiaVk4onVE4qTlSmiqniROWNiknlpOIJlROVqWJSmSqmi7XWbRdrrdsu1lq3ffiLym+qOFE5qZhUpoqpYlJ5o2JSmSomlROVqeKk4kRlqnij4kTliYpJ5URlqniiYlJ54mKtddvFWuu2i7XWbR/+Q8U3qZxUnKg8oTJVnFS8UTGpPFHxhsqJyhMVk8pUMVVMKt9U8U0Vk8rJxVrrtou11m0Xa63bPjyk8kTFGypvVEwqJypTxRMqU8WkMqm8oTJVnKicVEwqb1RMKlPFicpvqji5WGvddrHWuu1irXXbh3+MylRxojJVnFScqEwqJypTxRMVJypTxYnKN1WcqDxRMalMFScqU8UbKicV08Va67aLtdZtF2ut2z7841SmijdUpoqp4g2VqeIJlaniRGWqeENlqphUTireUJkqpooTlTcqTi7WWrddrLVuu1hr3fbhoYqfVDGpnFRMKm+oPFFxovKTKk5UpopvqphUpopJZap4Q2WqmFROKp64WGvddrHWuu1irXWb/cGg8psq3lB5omJSOak4UZkqJpWTim9SeaLiDZU3KiaVNyomlTcqpou11m0Xa63bLtZat9kfrLVuuVhr3Xax1rrtYq112/8BVz+L29pC+cgAAAAASUVORK5CYII=",
            //     "result": "success",
            //     "storageAvailable": false,
            //     "viewer_invite_code": "832dca02",
            //     "viewer_invite_link": "i.picaggo.com/832dca02",
            //     "viewer_qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADMCAYAAAA/IkzyAAAAAklEQVR4AewaftIAAAupSURBVO3BQY7cWhLAQFKo+1+Z42XCi2cJqvb3ABlhv7DWuuVirXXbxVrrtou11m0ffqPyN1X8JJWpYlJ5omJSmSomlaniDZWpYlKZKk5UnqiYVKaKN1Smiknlb6qYLtZat12stW67WGvd9uEPKr5J5QmVqWJS+aaKSeWk4gmVk4pJ5V+i8oTKT6r4JpWTi7XWbRdrrdsu1lq3fXhI5YmKf1nFpHKi8kbFpDKpTBWTyqRyojJVnFScqJyonFRMKt+k8kTFExdrrdsu1lq3Xay1bvvwf0ZlqphUTlSmiqniJ6mcVEwqU8Wk8oTKGxWTyknFExX/sou11m0Xa63bLtZat334x6hMFT9J5aTiRGWqmFSeUDlROamYVKaKE5Wp4idV/D+5WGvddrHWuu1irXXbh4cqflLFicpU8U0VJypTxRsVT6g8UfFExaTyTSpTxTdV/KSLtdZtF2ut2y7WWrd9+AOVv0llqnijYlKZKiaVqeIJlaliUjlRmSpOKiaVqWJSmSomlaliUpkqJpU3VKaKE5W/6WKtddvFWuu2i7XWbfYL/xCVk4onVKaKJ1SmikllqjhRmSqeUJkqnlB5ouKbVKaK/ycXa63bLtZat12stW6zX3hA5aTiROWJiknlpOJE5YmKE5WTiknlmyomlaniCZUnKn6SyknFpDJVfNPFWuu2i7XWbRdrrds+/EZlqpgq3qiYVN6omFROKk5UTlSmikllUpkqJpUnKiaVqWJSmSpOKiaVqWJSOan4poonVKaKSeWkYrpYa912sda67WKtdduHP1D5SRWTyhsVk8qkMlX8lyomlaliUnmi4m+qmFR+kspUMak8UXFysda67WKtddvFWuu2D39QMalMFW+oTBWTylQxqUwVU8UTFZPKVDGpPKEyVZyovKFyUnFSMalMFU9UTCpTxaQyqTxRMam8cbHWuu1irXXbxVrrtg8PVUwqU8WkclIxqTxRcaJyUjGpTBWTylQxqUwVJyo/qeJEZao4qZhUpoo3VKaKE5VJZaqYKk5UporpYq1128Va67aLtdZtH/5A5ZsqnqiYVKaKk4pJ5ZtUpooTlaniRGWqeELlpGJSmSqeUJkqJpWp4gmVqeJE5aTiiYu11m0Xa63bLtZat9kvPKAyVTyhMlWcqEwVJypTxRMqJxUnKt9U8YTKVDGpTBUnKm9U/E0qU8U3Xay1brtYa912sda67cNLKk9UnKicqJxUPKHyhsobFScqb6icqJxUTCpTxaQyqbxRMalMFU+oPFExXay1brtYa912sda67cNvVJ6omFROVKaKk4oTlROVqeKk4omKv6nim1R+UsWJylRxUvFGxaQyVZxcrLVuu1hr3Xax1rrtw28qflLFpPJGxaQyVUwqT6g8UTGpnFRMKlPFicpU8UbFpDJVvKEyVUwqU8VPqphUporpYq1128Va67aLtdZt9gsHKlPFpDJVTConFU+oTBWTyknFEyonFZPKScWk8kTFpHJS8YbKVDGpTBXfpPJNFZPKScV0sda67WKtddvFWuu2D79RmSomlROVk4pJ5YmKSeWk4kRlqnhCZaqYVCaVJyomlTdUpopJZap4Q2WqeKNiUpkqJpWTiicu1lq3Xay1brtYa9324TcVJxVvqEwVk8oTFU+oPFHxhMpUMalMFZPKExWTyqQyVUwqU8WJyonKVDGpTBWTylRxUvE3Xay1brtYa912sda6zX7hAZWpYlI5qZhUTiomlZ9UcaLykyomlZOKN1ROKv4mlScq/qaLtdZtF2ut2y7WWrd9+I3KScUbKm9UvKFyojJVTBVvqJyofJPKScWkcqIyVUwqU8VPUnmj4omLtdZtF2ut2y7WWrd9+E3FpDKpPFHxhMqJylQxqZxUTCpTxaQyVTyhclLxhMqkclIxqZxUPKHyhMoTFU+ovKEyVUwXa63bLtZat12stW778AcVT6icqEwVT1R8U8UTKicVU8WkcqIyVZxUnKhMFU+onFRMKpPKVHGicqIyVbyhMlWcXKy1brtYa912sda67cNvVJ6oeKLiJ1WcqPwklaniiYonVKaKJ1SeqJhUpooTlTcqnqj4pou11m0Xa63bLtZat314SeVE5Q2VqeJEZao4qThROamYVJ5Q+UkVT1Q8UTGpPFExqUwq36QyVTxxsda67WKtddvFWus2+4UXVKaKSWWqOFF5ouInqUwVJyonFZPKScUbKicVT6hMFScq31QxqUwVk8pUMamcVEwXa63bLtZat12stW778AcqJxWTyonKScWk8oTKVDGpnFQ8oTJVTCqTylQxqbyhclIxqUwVT6hMFVPFicpUcaIyVUwqJyonFScXa63bLtZat12stW778GUVk8pUMalMKicVJxWTyknFpPJNFScqU8WkMlVMKicVk8qJyknFpPKEyn+p4o2LtdZtF2ut2y7WWrd9+IOKSeUNlZOKSWVSOal4QmWqmFROKk5UvkllqphUJpWpYlJ5o+KJiidUvknlpOLkYq1128Va67aLtdZt9gsPqEwV/zKVJypOVE4qTlSmikllqphUnqiYVKaKSeWNikllqjhReaNiUnmjYrpYa912sda67WKtdZv9wqAyVZyonFRMKlPFicoTFZPKVPGGylTxTSonFZPKExUnKlPFicpPqvgmlScqpou11m0Xa63bLtZat334TcWkMlVMFU9UTCpTxRMVT6icVDyhMlVMKlPFScWJylQxqUwVk8pU8YTKVHGiclIxqUwqJxVvVEwqJxdrrdsu1lq3Xay1bvvwG5WpYlJ5omJSmSqeqDhRmSpOVN6omFSeUJkqTiqeUDlRmSpOKk5UpopJZVKZKiaVqWJSOan4pou11m0Xa63bLtZat334TcVPqphUTiomlZOKE5WpYlI5qXhD5SdVnKhMFScqU8WkMlX8lyomlanijYu11m0Xa63bLtZat334A5WTiidUpop/ScWkMqlMFVPFicoTKicVJypTxRsqU8WkMlU8oTJVTCrfpDJVnFystW67WGvddrHWus1+4UBlqjhRmSp+kspJxRMqU8UTKk9UfJPK31RxojJVTCpTxRsqU8WJyknFdLHWuu1irXXbxVrrtg9fVjGpnFRMKicVJxWTyknFVHGi8kbFpDJVTConFVPFpPJExYnKN1V8U8Wk8kTFycVa67aLtdZtF2ut2z48pHJSMVW8UfGEylQxqUwqJxXfpDJVfJPKVHGicqIyVUwqJxVvqJxUPFExqTxxsda67WKtddvFWuu2D79ReaLiCZWpYqqYVE4q3qh4o+IJlUnlv1QxqbxRMamcVEwqT6j8TRdrrdsu1lq3Xay1bvvwm4qfVHGiMlWcqEwVb6hMFScqU8WkclLxhMqkMlWcqEwVU8WJyhsVk8pJxRMqJypTxaQyVUwXa63bLtZat12stW778BuVv6niCZWpYlI5qZhU3qiYVKaKSeVEZap4QuWk4o2KE5UnKiaVE5Wp4omKSeWJi7XWbRdrrdsu1lq3ffiDim9SOak4qXhD5aRiUnmiYlJ5ouKJiknlROWJikllqpgqJpVvqvimiknl5GKtddvFWuu2i7XWbR8eUnmi4g2VqeInqUwVT6hMFZPKpPKGylRxonJSMam8UTGpTBUnKn9TxcnFWuu2i7XWbRdrrds+/GNUnlCZKk5UpopJ5QmVqeKk4kRlqnhC5ZsqTlSeqJhUpooTlaniDZWTiulirXXbxVrrtou11m0f/nEVk8oTKlPFScWJylQxqUwVP0llqnhDZaqYVE4q3lCZKqaKE5U3Kk4u1lq3Xay1brtYa9324aGKn1RxUnGiMlVMKlPFpDJVTBVvqEwVU8WkclJxojJVTConKk+oTBWTylTxhsobFU9crLVuu1hr3Xax1rrtwx+o/JdUpopJZao4qZhUpopJ5aTiRGWqmFSmijdUTlROKiaVqeJEZVJ5QuWJihOVE5WTiulirXXbxVrrtou11m32C2utWy7WWrddrLVuu1hr3fY/sDigCYAUCYYAAAAASUVORK5CYII="
            // };
            const server_response = {
                "name": "Test Event",
                "category_id": "96",
                "storageAvailable": false,
                "event_id": "1625",
                "qrCode": "data:image/png;base64,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",
                "viewer_qrCode": "data:image/png;base64,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",
                "invite_link": "i.picaggo.com/5183009b",
                "invite_code": "5183009b",
                "viewer_invite_link": "i.picaggo.com/37b48eb4",
                "viewer_invite_code": "37b48eb4",
                "result": "success"
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