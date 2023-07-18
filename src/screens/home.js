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

      console.log(
        unixCurrentTime,
        '<',
        unixEventEndTime,
        ' = ',
        unixCurrentTime < unixEventEndTime,
      );
      if (unixEventEndTime > unixCurrentTime) {
        addEvent(event);
        navigateToEventScreen();
      } else {
        createNewEvent();
      }
    } else {
      const server_response = {
        category_id: '96',
        end_time: 1689768512,
        event_id: '1665',
        invite_code: '23fc3daa',
        invite_link: 'i.picaggo.com/23fc3daa',
        name: 'Test Event1',
        qrCode:
          'data:image/png;base64,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',
        result: 'success',
        start_time: 1689336512,
        storageAvailable: false,
        viewer_invite_code: '884b377d',
        viewer_invite_link: 'i.picaggo.com/884b377d',
        viewer_qrCode:
          'data:image/png;base64,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',
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
      name: 'Test Event1',
    };

    try {
      showLoader('Creating Event...');
      const response = await api.post(
        'https://icfzx3vc69.execute-api.us-west-1.amazonaws.com/create_event',
        requestBody,
        headers,
      );
      const timing = getUnixTimeSteamp(5);
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
      <Button title="Create Event(5 Days default)" onPress={createEvent} />
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
