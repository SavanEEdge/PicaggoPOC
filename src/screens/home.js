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
        category_id: '177',
        end_time: 1697028789,
        event_id: '1777',
        invite_code: '72325a9c',
        invite_link: 'i.picaggo.com/72325a9c',
        name: 'Event on 11 Sep',
        qrCode:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAADMCAYAAAA/IkzyAAAAAklEQVR4AewaftIAAAvHSURBVO3BQY4kx7IgQdVA3f/KOr00cOEMR2b14x+YiP3BWuuVh7XWaw9rrdce1lqv/fAPKn9TxQ2VqeJE5aRiUpkqJpVPVHxCZaqYVKaKE5UbFb9JZaqYVP6miulhrfXaw1rrtYe11ms//IuKb1K5oTJVTCo3Kk4qJpWpYlKZKiaVSeWkYlL5L1E5qZhUflPFN6mcPKy1XntYa732sNZ67YdLKjcqflPFpHJD5YbKicpJxaQyqUwVk8qkcqIyVZxUnKicqJxUTCrfpHKj4sbDWuu1h7XWaw9rrdd++D9GZaq4oTJVTCpTxYnKScWkclIxqUwVk8oNlU9UTConFTcq/sse1lqvPay1XntYa732w3+MylRxo2JS+U0VJyo3VE5UTiomlaniRGWq+E0V/5c8rLVee1hrvfaw1nrth0sVv6niROWk4obKDZWTihsVN1RuVNyomFS+SWWq+KaK3/Sw1nrtYa312sNa67Uf/oXK36QyVZxUTCpTxaQyVUwqNyomlaliUjlRmSpOKiaVqWJSmSomlaliUpkqJpVPqEwVJyp/08Na67WHtdZrD2ut1374h4r/EpWpYlKZKiaVqeKkYlKZKn5TxScqTiomlRsVJxWfqDip+F96WGu99rDWeu1hrfXaD5dUTipOVG5UTCo3KiaVGxUnKp9Q+SaVGxWTyqRyUnGj4obKScWkMlV808Na67WHtdZrD2ut1374B5WpYqr4RMWk8omKSeWk4kTlRGWqmFQmlaliUrlRMalMFScqJxWTylQxqZxUfFPFDZWpYlI5qZge1lqvPay1XntYa732w79Q+U0Vk8onKiaVSWWq+F+qmFSmiknlhspU8ZsqJpXfpDJVTCo3Kk4e1lqvPay1XntYa732w7+omFSmik+onKhMFZPKVDFV3KiYVKaKSeWGyknFjYobKlPFpDJVTCpTxY2KSWWqmFQmlRsVk8onHtZarz2stV57WGu9Zn8wqEwVJypTxaRyUnGiMlXcUDmpmFSmikllqphUpooTlRsVk8pU8TepTBWTylQxqZxUnKicVNxQmSqmh7XWaw9rrdce1lqv/fAvVL6pYlKZKqaKSWWqOKmYVL5JZaqYVKaKqWJSOVE5UZkqJpWTik+oTBWTylRxQ2WqOFE5qbjxsNZ67WGt9drDWus1+4MLKlPFDZWTikllqjhRmSpuqJxUnKhMFZPKVDGpTBWTyo2KT6h8ouJvUpkqvulhrfXaw1rrtYe11mv2BxdUPlFxovKJihsqNyomlZOKT6icVEwqn6g4UZkqJpVvqphUpopJZaqYVG5UTA9rrdce1lqvPay1XvvhH1R+k8pUcVJxonKiMlWcVNyo+ITKVHFScaPiROU3VZyoTBUnFZ+omFSmipOHtdZrD2ut1x7WWq/98A8VJypTxaRyUnFScaNiUpkqJpUbKjcqJpWp4hMqJxXfpDJVfEJlqphUporfVDGpTBXTw1rrtYe11msPa63XfvgXKjcqJpVJZaqYVKaKSWWquFHxTRWTylQxqfwmlanipGJSuaEyVZxUnFRMKp9QmSomlRsPa63XHtZarz2stV774R9UpoobKicVk8qNiknlROVGxVQxqUwqU8WkMlVMKpPKVDGpfEJlqjip+ITKVPGJikllqphUTipuPKy1XntYa732sNZ6zf7ggspUcUNlqphUTipuqEwVk8pUMamcVEwqU8WkMlVMKlPFpDJVTConFZPKVHGicqNiUpkqJpWp4hMqU8UnHtZarz2stV57WGu9Zn8wqEwVN1ROKiaVGxWTyjdV3FD5popJ5aTiEyonFX+Tyo2Kv+lhrfXaw1rrtYe11mv2BwcqJxWTyjdV/CaVk4pJZaq4ofJNFScqJxWTylQxqUwVk8pUcUPlb6q48bDWeu1hrfXaw1rrNfuDQeWbKm6onFScqHyi4ptUTipuqNyomFSmihsqNyomlRsVN1RuVEwqU8X0sNZ67WGt9drDWuu1Hy5VnKicqEwVn1A5qZhUpopJ5aRiUpkqpopJ5URlqjipOFGZKr6pYlKZVKaKE5UTlaniEypTxcnDWuu1h7XWaw9rrdd++BcVk8pUcaPiRsWkMlWcqHyTym+quKEyVdxQOamYKm5UTCqfqLhRMalMFTce1lqvPay1XntYa71mfzCo/JdVnKhMFZPKVHGi8omKSeU3VdxQmSomlaliUpkqJpWTiknlb6q48bDWeu1hrfXaw1rrNfuDD6hMFZPKVHGicqPim1ROKiaVGxWTyknFJ1ROKm6oTBUnKt9UMalMFTdUTiqmh7XWaw9rrdce1lqv/fAvVE4qTiomlZOKSeWGylQxqUwVU8WkcqNiUplUpopJ5RMqJxWTylRxQ2WqmCpOVKaKE5WpYlKZKiaVk4qTh7XWaw9rrdce1lqv/fBlKicVk8qkclJxQ+VEZaq4UXFScaIyVUwqU8WkclIxqZyonFRMKjdU/iaVqeITD2ut1x7WWq89rLVe++FfVEwqNyomlZOKSWVSmSo+UTGpfJPKN6lMFZPKpDJVTCqfqLhRcUPlm1ROKk4e1lqvPay1XntYa71mf3BBZao4UZkqfpPKN1VMKjcqJpWpYlKZKiaVT1ScqHyiYlKZKk5UPlExqXyiYnpYa732sNZ67WGt9Zr9waAyVZyoTBUnKlPFicqNikllqviEylTxTSonFZPKScWkMlVMKlPFicpvqvgmlRsV08Na67WHtdZrD2ut1374h4pJZaqYKiaVqWKqmFSmihsVN1ROKm6oTBWTylRxUnGiMlVMKr9JZao4UTmpmFQmlZOKT1RMKicPa63XHtZarz2stV774R9UpopJ5RMqU8WNihOVqeJE5RMVk8oNlanipOKGyonKVHFScaIyVUwqk8pUMalMFZPKScU3Pay1XntYa732sNZ67Yd/qPhExUnFpHJSMamcVJyoTBWTyknFJ1T+popJZao4UZkqJpWp4n+pYlKZKj7xsNZ67WGt9drDWuu1H/6FyknFDZWp4r+kYlKZVKaKqeJE5YbKScWNik+oTBWTylRxQ2WqmFS+SWWqOHlYa732sNZ67WGt9Zr9wYHKVHGiMlX8JpWTihsqU8UNlRsVf5PKN1WcqEwVk8pU8QmVqeJE5aRielhrvfaw1nrtYa312g9fVjGpnFRMKicVJxWTyknFVHGi8omKSWWqmFROKr6p4kTlmyq+qWJSuVFx8rDWeu1hrfXaw1rrtR8uqZxUTBWfqLihMlVMKpPKScU3qUwV36QyVUwVk8qJylQxqZxUfELlpOJGxaQyqUwV08Na67WHtdZrD2ut1374B5UbFTdUbqicVHyi4hMVN1QmlU+ofKJiUvlExaRyUjGp3FD5RMWNh7XWaw9rrdce1lqv/fAPFb+p4kRlqjhRmSo+oTJVnKhMFZPKScUNlaliUjlRmSqmihOVT1RMKicVN1ROVKaKSWWqmB7WWq89rLVee1hrvfbDP6j8TRU3VKaKSWWqOFE5UZkqTlSmiknlRGWqOFGZKiaVqeITFScqNyomlROVqeJGxaRy42Gt9drDWuu1h7XWaz/8i4pvUjmpOKn4TRWTyo2KT1TcqJhUTlRuVEwqU8VUMal8U8U3VUwqJw9rrdce1lqvPay1XvvhksqNik+onFScqNxQmSomlaliUrmh8gmVqeJE5aRiUvlExaQyVZyo/E0VJw9rrdce1lqvPay1XvvhP0ZlqjhRmSomlaniRGVSOVGZKiaVqWJSmSomlZOKSeWbKk5UblRMKlPFicpU8QmVk4rpYa312sNa67WHtdZrP/wfo3KjYlKZKqaKE5WpYlKZKiaVqeJGxaQyVXxCZaqYVE4qPqEyVUwVJyqfqDh5WGu99rDWeu1hrfXaD5cqflPFScWJylQxVZyofJPKicpUMVVMKlPFicpU8ZtUpopJZar4X6q48bDWeu1hrfXaw1rrNfuDQeVvqvibVKaK/5+o3Kg4UTmpmFRuVEwqNypOVD5RMT2stV57WGu99rDWes3+YK31ysNa67WHtdZrD2ut1/4ffGnrqyc08RwAAAAASUVORK5CYII=',
        result: 'success',
        start_time: 1694436789,
        storageAvailable: false,
        viewer_invite_code: '2ea61c75',
        viewer_invite_link: 'i.picaggo.com/2ea61c75',
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
      scheduledEndTime: getUnixTimeSteamp(60)?.endTime,
      category: 'Business',
      name: 'Event on 11 Sep',
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
    navigation.push('event');
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
