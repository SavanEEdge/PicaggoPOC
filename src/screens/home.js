import React, { useEffect, useState } from 'react';
import { Text, View, Button, StyleSheet, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { useUser } from '../hooks/useUser';
import { encodedData, getHash, getUnixTimeSteamp } from '../utils/helper';
import { useLoader } from '../hooks/useLoader';
import { useEvent } from '../hooks/useEvent';
import { StorageService } from '../service/storage_service';

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
            addEvent(event);
        } else {
            // create new event
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
            //             const res = JSON.parse(this.response);
            //             console.log("Response", res);
            //             hideLoader();
            //         } else {
            //             console.log(JSON.stringify(this.response, null, 2));
            //             hideLoader();
            //         }
            //     }
            // });

            const server_response = {
                "category_id": "96",
                "event_id": "1622",
                "invite_code": "e51a442d",
                "invite_link": "i.picaggo.com/e51a442d",
                "name": "Test Event",
                "qrCode": "data:image/png;base64,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KicVk8pUMamcVJyonFS8oTJVTCpTxaRyUjGpnKicVEwqT6j8JpWp4o2LtdZtF2ut2y7WWrd9+A8Vk8obKicVk8qkcqLyhMpU8YTKb1KZKiaVSWWqmFTeqHii4gmVb1I5qTi5WGvddrHWuu1irXWb/cEDKlPFicpU8ZtU3qiYVJ6omFSmikllqphUnqh4QuWNikllqjhReaNiUnmjYrpYa912sda67WKtdZv9waAyVZyonFRMKlPFicoTFZPKVPGGylTxTSonFZPKExUnKlPFicpPqvgmlScqpou11m0Xa63bLtZat334S8WkMlVMFU9UTCpTxRMVT6icVDyhMlVMKlPFScWJylQxqfwklaniROWkYlKZVE4q3qiYVE4u1lq3Xay1brtYa9324S8qU8WkclJxojJVPFFxojJVnKi8UTGpPKEyVZxUfJPKVHFScaIyVUwqk8pUMalMFZPKScU3Xay1brtYa912sda67cNfKn5SxaRyUjGpnFScqEwVk8pJxRsq36RyUnFScaIyVUwqU8X/UsWkMlW8cbHWuu1irXXbxVrrtg//QeWk4gmVqeJfUjGpTCpTxVRxovKEyhMVJypTxRMqU8WkMlU8oTJVTCrfpDJVnFystW67WGvddrHWus3+4EBlqjhRmSp+kspJxRMqU8UTKk9U/C+pvFFxojJVTCpTxRsqU8UTKlPFdLHWuu1irXXbxVrrtg9fVjGpnFRMKicVJxWTyknFVHGi8kbFpDJVTCq/qeJE5ZsqvqliUjmpmCpOLtZat12stW67WGvd9uEhlZOKqeKNiidUpopJZVI5qXijYlKZKn5SxYnKicpUMamcVLyhclLxRMWJylQxXay1brtYa912sda67cNfVJ6oeELlpGJSOal4o+KNijdU/pcqJpU3KiaVk4pJ5QmVb6o4uVhr3Xax1rrtYq1124e/VPykihOVqeJEZap4Q2WqOFGZKiaVk4onVE4qTlSmiqniROWNiknlpOIJlROVqWJSmSqmi7XWbRdrrdsu1lq3ffiLym+qOFE5qZhUpoqpYlJ5o2JSmSomlROVqeKk4kRlqnij4kTliYpJ5URlqniiYlJ54mKtddvFWuu2i7XWbR/+Q8U3qZxUnKg8oTJVnFS8UTGpPFHxhsqJyhMVk8pUMVVMKt9U8U0Vk8rJxVrrtou11m0Xa63bPjyk8kTFGypvVEwqJypTxRMqU8WkMqm8oTJVnKicVEwqb1RMKlPFicpvqji5WGvddrHWuu1irXXbh3+MylRxojJVnFScqEwqJypTxRMVJypTxYnKN1WcqDxRMalMFScqU8UbKicV08Va67aLtdZtF2ut2z7841SmijdUpoqp4g2VqeIJlaniRGWqeENlqphUTireUJkqpooTlTcqTi7WWrddrLVuu1hr3fbhoYqfVDGpnFRMKm+oPFFxovKTKk5UpopvqphUpopJZap4Q2WqmFROKp64WGvddrHWuu1irXWb/cGg8psq3lB5omJSOak4UZkqJpWTim9SeaLiDZU3KiaVNyomlTcqpou11m0Xa63bLtZat9kfrLVuuVhr3Xax1rrtYq112/8BVz+L29pC+cgAAAAASUVORK5CYII=",
                "result": "success",
                "storageAvailable": false,
                "viewer_invite_code": "832dca02",
                "viewer_invite_link": "i.picaggo.com/832dca02",
                "viewer_qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADMCAYAAAA/IkzyAAAAAklEQVR4AewaftIAAAupSURBVO3BQY7cWhLAQFKo+1+Z42XCi2cJqvb3ABlhv7DWuuVirXXbxVrrtou11m0ffqPyN1X8JJWpYlJ5omJSmSomlaniDZWpYlKZKk5UnqiYVKaKN1Smiknlb6qYLtZat12stW67WGvd9uEPKr5J5QmVqWJS+aaKSeWk4gmVk4pJ5V+i8oTKT6r4JpWTi7XWbRdrrdsu1lq3fXhI5YmKf1nFpHKi8kbFpDKpTBWTyqRyojJVnFScqJyonFRMKt+k8kTFExdrrdsu1lq3Xay1bvvwf0ZlqphUTlSmiqniJ6mcVEwqU8Wk8oTKGxWTyknFExX/sou11m0Xa63bLtZat334x6hMFT9J5aTiRGWqmFSeUDlROamYVKaKE5Wp4idV/D+5WGvddrHWuu1irXXbh4cqflLFicpU8U0VJypTxRsVT6g8UfFExaTyTSpTxTdV/KSLtdZtF2ut2y7WWrd9+AOVv0llqnijYlKZKiaVqeIJlaliUjlRmSpOKiaVqWJSmSomlaliUpkqJpU3VKaKE5W/6WKtddvFWuu2i7XWbfYL/xCVk4onVKaKJ1SmikllqjhRmSqeUJkqnlB5ouKbVKaK/ycXa63bLtZat12stW6zX3hA5aTiROWJiknlpOJE5YmKE5WTiknlmyomlaniCZUnKn6SyknFpDJVfNPFWuu2i7XWbRdrrds+/EZlqpgq3qiYVN6omFROKk5UTlSmikllUpkqJpUnKiaVqWJSmSpOKiaVqWJSOan4poonVKaKSeWkYrpYa912sda67WKtdduHP1D5SRWTyhsVk8qkMlX8lyomlaliUnmi4m+qmFR+kspUMak8UXFysda67WKtddvFWuu2D39QMalMFW+oTBWTylQxqUwVU8UTFZPKVDGpPKEyVZyovKFyUnFSMalMFU9UTCpTxaQyqTxRMam8cbHWuu1irXXbxVrrtg8PVUwqU8WkclIxqTxRcaJyUjGpTBWTylQxqUwVJyo/qeJEZao4qZhUpoo3VKaKE5VJZaqYKk5UporpYq1128Va67aLtdZtH/5A5ZsqnqiYVKaKk4pJ5ZtUpooTlaniRGWqeELlpGJSmSqeUJkqJpWp4gmVqeJE5aTiiYu11m0Xa63bLtZat9kvPKAyVTyhMlWcqEwVJypTxRMqJxUnKt9U8YTKVDGpTBUnKm9U/E0qU8U3Xay1brtYa912sda67cNLKk9UnKicqJxUPKHyhsobFScqb6icqJxUTCpTxaQyqbxRMalMFU+oPFExXay1brtYa912sda67cNvVJ6omFROVKaKk4oTlROVqeKk4omKv6nim1R+UsWJylRxUvFGxaQyVZxcrLVuu1hr3Xax1rrtw28qflLFpPJGxaQyVUwqT6g8UTGpnFRMKlPFicpU8UbFpDJVvKEyVUwqU8VPqphUporpYq1128Va67aLtdZt9gsHKlPFpDJVTConFU+oTBWTyknFEyonFZPKScWk8kTFpHJS8YbKVDGpTBXfpPJNFZPKScV0sda67WKtddvFWuu2D79RmSomlROVk4pJ5YmKSeWk4kRlqnhCZaqYVCaVJyomlTdUpopJZap4Q2WqeKNiUpkqJpWTiicu1lq3Xay1brtYa9324TcVJxVvqEwVk8oTFU+oPFHxhMpUMalMFZPKExWTyqQyVUwqU8WJyonKVDGpTBWTylRxUvE3Xay1brtYa912sda6zX7hAZWpYlI5qZhUTiomlZ9UcaLykyomlZOKN1ROKv4mlScq/qaLtdZtF2ut2y7WWrd9+I3KScUbKm9UvKFyojJVTBVvqJyofJPKScWkcqIyVUwqU8VPUnmj4omLtdZtF2ut2y7WWrd9+E3FpDKpPFHxhMqJylQxqZxUTCpTxaQyVTyhclLxhMqkclIxqZxUPKHyhMoTFU+ovKEyVUwXa63bLtZat12stW778AcVT6icqEwVT1R8U8UTKicVU8WkcqIyVZxUnKhMFU+onFRMKpPKVHGicqIyVbyhMlWcXKy1brtYa912sda67cNvVJ6oeKLiJ1WcqPwklaniiYonVKaKJ1SeqJhUpooTlTcqnqj4pou11m0Xa63bLtZat314SeVE5Q2VqeJEZao4qThROamYVJ5Q+UkVT1Q8UTGpPFExqUwq36QyVTxxsda67WKtddvFWus2+4UXVKaKSWWqOFF5ouInqUwVJyonFZPKScUbKicVT6hMFScq31QxqUwVk8pUMamcVEwXa63bLtZat12stW778AcqJxWTyonKScWk8oTKVDGpnFQ8oTJVTCqTylQxqbyhclIxqUwVT6hMFVPFicpUcaIyVUwqJyonFScXa63bLtZat12stW778GUVk8pUMalMKicVJxWTyknFpPJNFScqU8WkMlVMKicVk8qJyknFpPKEyn+p4o2LtdZtF2ut2y7WWrd9+IOKSeUNlZOKSWVSOal4QmWqmFROKk5UvkllqphUJpWpYlJ5o+KJiidUvknlpOLkYq1128Va67aLtdZt9gsPqEwV/zKVJypOVE4qTlSmikllqphUnqiYVKaKSeWNikllqjhReaNiUnmjYrpYa912sda67WKtdZv9wqAyVZyonFRMKlPFicoTFZPKVPGGylTxTSonFZPKExUnKlPFicpPqvgmlScqpou11m0Xa63bLtZat334TcWkMlVMFU9UTCpTxRMVT6icVDyhMlVMKlPFScWJylQxqUwVk8pU8YTKVHGiclIxqUwqJxVvVEwqJxdrrdsu1lq3Xay1bvvwG5WpYlJ5omJSmSqeqDhRmSpOVN6omFSeUJkqTiqeUDlRmSpOKk5UpopJZVKZKiaVqWJSOan4pou11m0Xa63bLtZat334TcVPqphUTiomlZOKE5WpYlI5qXhD5SdVnKhMFScqU8WkMlX8lyomlanijYu11m0Xa63bLtZat334A5WTiidUpop/ScWkMqlMFVPFicoTKicVJypTxRsqU8WkMlU8oTJVTCrfpDJVnFystW67WGvddrHWus1+4UBlqjhRmSp+kspJxRMqU8UTKk9UfJPK31RxojJVTCpTxRsqU8WJyknFdLHWuu1irXXbxVrrtg9fVjGpnFRMKicVJxWTyknFVHGi8kbFpDJVTConFVPFpPJExYnKN1V8U8Wk8kTFycVa67aLtdZtF2ut2z48pHJSMVW8UfGEylQxqUwqJxXfpDJVfJPKVHGicqIyVUwqJxVvqJxUPFExqTxxsda67WKtddvFWuu2D79ReaLiCZWpYqqYVE4q3qh4o+IJlUnlv1QxqbxRMamcVEwqT6j8TRdrrdsu1lq3Xay1bvvwm4qfVHGiMlWcqEwVb6hMFScqU8WkclLxhMqkMlWcqEwVU8WJyhsVk8pJxRMqJypTxaQyVUwXa63bLtZat12stW778BuVv6niCZWpYlI5qZhU3qiYVKaKSeVEZap4QuWk4o2KE5UnKiaVE5Wp4omKSeWJi7XWbRdrrdsu1lq3ffiDim9SOak4qXhD5aRiUnmiYlJ5ouKJiknlROWJikllqpgqJpVvqvimiknl5GKtddvFWuu2i7XWbR8eUnmi4g2VqeInqUwVT6hMFZPKpPKGylRxonJSMam8UTGpTBUnKn9TxcnFWuu2i7XWbRdrrds+/GNUnlCZKk5UpopJ5QmVqeKk4kRlqnhC5ZsqTlSeqJhUpooTlaniDZWTiulirXXbxVrrtou11m0f/nEVk8oTKlPFScWJylQxqUwVP0llqnhDZaqYVE4q3lCZKqaKE5U3Kk4u1lq3Xay1brtYa9324aGKn1RxUnGiMlVMKlPFpDJVTBVvqEwVU8WkclJxojJVTConKk+oTBWTylTxhsobFU9crLVuu1hr3Xax1rrtwx+o/JdUpopJZao4qZhUpopJ5aTiRGWqmFSmijdUTlROKiaVqeJEZVJ5QuWJihOVE5WTiulirXXbxVrrtou11m32C2utWy7WWrddrLVuu1hr3fY/sDigCYAUCYYAAAAASUVORK5CYII="
            };
            const event_obj = { ...server_response, start_time: 1687558855, end_time: 1688010655 };
            addEvent(event_obj);
            StorageService.setValue("event_details", event_obj);
        }
        navigation.push("event")
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