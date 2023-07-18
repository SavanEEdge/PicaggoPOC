import {useEffect} from 'react';
import {Image, ScrollView, StyleSheet, Text, View} from 'react-native';
import {useEvent} from '../hooks/useEvent';
import {getAssetsByEventTime, requestPermission} from '../utils/helper';
import {useMedia} from '../hooks/useMedia';
import {eventEmitter} from '../event';
import {useInactiveBackgroundState} from '../hooks/useInactiveBackgroundState';
import {useDispatch} from 'react-redux';
import {loadMediaFromDataBase} from '../redux/slices/media';
import {ActivityIndicator} from 'react-native';

function Event() {
  const {event} = useEvent();
  const {media, addAssets} = useMedia();
  const dispatch = useDispatch();

  useInactiveBackgroundState(init);

  useEffect(() => {
    dispatch(loadMediaFromDataBase(init));
  }, []);

  useEffect(() => {
    eventEmitter.addListener('media', data => {
      console.log('New data comming...', data);
      dispatch(loadMediaFromDataBase());
    });

    return () => {
      eventEmitter.removeListener('media');
    };
  }, []);

  async function init() {
    const isPermission = await requestPermission();
    if (!!event) {
      if (isPermission) {
        const result = await getAssetsByEventTime(
          event?.start_time,
          event?.end_time,
        );
        addAssets(result);
      }
    }
  }

  return (
    <View style={styles.container}>
      {event?.event_id && (
        <Text style={styles.text}>Event Id: {event?.event_id}</Text>
      )}
      {event?.name && (
        <Text style={styles.text}>Event Name: {event?.name}</Text>
      )}
      {event?.start_time && (
        <Text style={styles.text}>Event Start Time: {event?.start_time}</Text>
      )}
      <ScrollView>
        {media.assets.map(media => {
          if (media.isImage) {
            return (
              <View key={media.uri} style={{marginVertical: 10}}>
                <Image
                  source={{uri: media.uri}}
                  style={{width: '100%', height: 250}}
                />
                {!media.isUploaded && (
                  <View
                    style={{
                      height: 20,
                      width: 20,
                      backgroundColor: 'transparent',
                      position: 'absolute',
                      right: 10,
                      top: 10,
                    }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
            );
          } else {
            console.log(media.thumbnail);
            return (
              <View key={media.uri} style={{marginVertical: 10}}>
                <Image
                  source={{uri: `file://${media.thumbnail.path}`}}
                  style={{width: '100%', height: 250}}
                />
                {!media.isUploaded && (
                  <View
                    style={{
                      height: 20,
                      width: 20,
                      backgroundColor: 'transparent',
                      position: 'absolute',
                      right: 10,
                      top: 10,
                    }}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
              </View>
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
    color: 'black',
    textAlign: 'center',
    fontSize: 20,
    paddingVertical: 5,
  },
});

export {Event};
