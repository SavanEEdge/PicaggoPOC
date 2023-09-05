import React, {useEffect, useState} from 'react';
import {Text, View, Button, StyleSheet, ActivityIndicator} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useUser} from '../hooks/useUser';
import {
  encodedData,
  generateFileName,
  getHash,
  getMD5,
  getUnixTimeSteamp,
  parseJson,
  requestPermission,
} from '../utils/helper';
import {useLoader} from '../hooks/useLoader';
import {useEvent} from '../hooks/useEvent';
import {StorageService} from '../service/storage_service';
import api from '../api';
import moment from 'moment';

function Home({navigation}) {
  const {user, userLogout} = useUser();
  const {addEvent} = useEvent();
  const {showLoader, hideLoader} = useLoader();

  async function onLogout() {
    await auth().signOut();
    userLogout();
  }

  async function createEvent() {
    const event = StorageService.getValue('event_details');
    if (!!event) {
      // Event is running
      // reactotron.log("Event", event);
      const unixCurrentTime = moment.utc().unix();
      const unixEventEndTime = event?.end_time;

      // console.log(
      //   unixCurrentTime,
      //   '<',
      //   unixEventEndTime,
      //   ' = ',
      //   unixCurrentTime < unixEventEndTime,
      // );
      if (unixEventEndTime > unixCurrentTime) {
        addEvent(event);
        navigateToEventScreen();
      } else {
        createNewEvent();
      }
    } else {
      const server_response = {
        category_id: '96',
        end_time: 1692270215,
        event_id: '1681',
        invite_code: 'c16afffb',
        invite_link: 'i.picaggo.com/c16afffb',
        name: 'Final Test',
        qrCode:
          'data:image/png;base64,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',
        result: 'success',
        start_time: 1689678215,
        storageAvailable: false,
        viewer_invite_code: 'a75d71d4',
        viewer_invite_link: 'i.picaggo.com/a75d71d4',
        viewer_qrCode:
          'data:image/png;base64,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UjGpTConFScqk8pJxRsVk8pUcaIyVUwqU8WkclIxqZyonFRMKk+o/Jcq3rhYa912sda67WKtdduHP6iYVE4qTlROKiaVSeUnqXyTyjepTBWTyqQyVUwqb1Q8UfGEyjepnFScXKy1brtYa912sda6zX7hAZWpYlI5qfibVE4qnlA5qThRmSomlaliUnmi4gmVNyomlaniROWNiknljYrpYq1128Va67aLtdZt9guDylRxojJVTConFScqT1RMKlPFGypTxTepnFRMKm9UTCpTxYnKT6r4JpUnKqaLtdZtF2ut2y7WWrd9+E3FpDJVTBWTylRxojJVPFHxhMpJxRMqU8WkMlWcVJyoTBWTylQxqbyhMlWcqJxUTCqTyknFGxWTysnFWuu2i7XWbRdrrds+/EZlqphUnlA5qXii4kRlqjhReaNiUnlCZao4qXhC5URlqjipOFGZKiaVSWWqmFSmiknlpOKbLtZat12stW67WGvd9uE3FW9UPKFyUjGpnFScqEwVk8pJxRsq/5KKE5WpYlKZKv5LFZPKVPHGxVrrtou11m0Xa63bPvyByknFEypTxb+kYlKZVKaKqeJE5QmVNyq+SWWqmFSmiidUpopJ5ZtUpoqTi7XWbRdrrdsu1lq32S8cqEwVJypTxU9SOal4QmWqeELliYo3VE4qJpVvqjhRmSomlaniDZWp4gmVqWK6WGvddrHWuu1irXXbhy+rmFROKiaVk4qTiknlpGKqOFF5o2JSmSomlW+qmFSmihOVb6r4popJ5aRiqji5WGvddrHWuu1irXXbh4dUTiqmijcqnlCZKiaVSeWk4o2KSWWqeKPiJ6lMFZPKScUbKicVT1RMKlPFycVa67aLtdZtF2ut2z78RuWJiidUnlA5qXij4o2KE5UTlTdUTipOKiaVNyomlZOKSeUJlTcqnrhYa912sda67WKtdduH31T8pIoTlaniRGWqeENlqjhRmSqeqHhCZap4QmWqmCpOVN6omFROKp5QOVGZKiaVqWK6WGvddrHWuu1irXXbh9+o/E0Vb1RMKlPFVDGpnKicVEwqU8WkcqIyVbyhMlW8UXGi8kTFpHKiMlU8UTGpPHGx1rrtYq1128Va67YPf1DxTSonFZPKScWJylRxUvFGxRsVb6icqDxRMalMFVPFpPJNFd9UMamcXKy1brtYa912sda67cNDKk9UvFExqfwklaniCZUnVN5QmSpOVE4qJpU3KiaVqeJE5W+qOLlYa912sda67WKtdduHf4zKEypTxaQyqUwVk8qk8kTFpHJSMalMFU+ofFPFicoTFZPKVHGiMlW8oXJSMV2stW67WGvddrHWuu3D/5mKSeWbKk5UpopJ5QmVE5WpYlKZKt5QmSomlZOKN1SmiqniROWNipOLtdZtF2ut2y7WWrd9eKjiJ1VMKicVk8obKicVT1RMKk9UnFScqEwVT6icVEwqU8WkMlW8oTJVTConFU9crLVuu1hr3Xax1rrtwx+o/JcqJpWp4omKk4oTlaniROWk4ptUTlSmiqliUpkqJpUTlSdU/iaVk4rpYq1128Va67aLtdZt9gtrrVsu1lq3Xay1brtYa932P36iivGdzBTOAAAAAElFTkSuQmCC',
      };

      addEvent(server_response);
      StorageService.setValue('event_details', server_response);
      navigateToEventScreen();
      // createNewEvent();
    }
  }

  const createNewEvent = async () => {
    // create new event
    const headers = {
      Authorization: user.firebaseAuthToken?.trim(),
    };
    const requestBody = {
      user_id: user?.user?.user_id,
      sender_name: user?.user?.name,
      default_upload: true,
      scheduledEndTime: getUnixTimeSteamp(30)?.endTime,
      category: 'Party',
      name: 'Final Test',
    };

    try {
      showLoader('Creating Event...');
      const response = await api.post(
        'https://icfzx3vc69.execute-api.us-west-1.amazonaws.com/create_event',
        requestBody,
        headers,
      );
      const timing = getUnixTimeSteamp(30);
      if (response.status) {
        const server_response = parseJson(response.data);
        console.log('Response', server_response);
        const event_obj = {
          ...server_response,
          start_time: timing?.startTime,
          end_time: timing?.endTime,
        };
        console.log('event_obj', event_obj);
        addEvent(event_obj);
        StorageService.setValue('event_details', event_obj);
        hideLoader();
        navigateToEventScreen();
      }
      hideLoader();
    } catch (e) {
      console.log('AWS fetch error: ', e);
      hideLoader();
    }
  };

  const navigateToEventScreen = async () => {
    const isPermission = await requestPermission();
    if (isPermission) {
      navigation.push('event');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>User Id: {user?.user?.user_id}</Text>
      <Text style={styles.text}>User Name: {user?.user?.name}</Text>
      <Button title="View Live Event" onPress={createEvent} />
      <Button title="Logout" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
    paddingVertical: 5,
  },
});

export {Home};
