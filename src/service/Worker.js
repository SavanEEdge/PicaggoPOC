import BackgroundService from 'react-native-background-actions';
import reactotron from 'reactotron-react-native';
import { Worker } from './queue';
import { deleteFileFromS3, uploadImageToS3, uploadVideoToS3 } from './aws';
import { DBInstance } from './realm';
import api from '../api';

const veryIntensiveTask = async (taskDataArguments) => {
    const { action, payload } = taskDataArguments;
    reactotron.log("Action ", action);
    reactotron.log("Payload ", payload);


    if (action == Worker.UPLOAD_SERVER) {
        try {
            const { requestBody, headers } = payload;
            const { id, ...rest } = requestBody;
            const response = await api.post("https://sdrobz9xp1.execute-api.us-west-1.amazonaws.com/add_live_media_data", rest, headers);
            if (response.status) {
                const dbMedia = DBInstance.objects('media').filtered(`id=="${id}"`)[0];
                DBInstance.write(() => {
                    dbMedia.isUploaded = true;
                })
            }
        } catch (e) {
            console.log("Media Upload error: ", e);
        }
    } else if (action == Worker.UPLOAD_IMAGE_S3) {
        try {
            await uploadImageToS3(payload.path, payload.key);
        } catch (e) {
            console.log("S3 Image Upload error: ", e);
        }

    } else if (action == Worker.UPLOAD_VIDEO_S3) {
        try {
            await deleteFileFromS3(payload.key);
            await uploadVideoToS3(payload.path, payload.key);
        } catch (e) {
            console.log("S3 Video Upload error: ", e);
        }

    }
};



export async function UploadStart(data) {
    const options = {
        taskName: 'Upload',
        taskTitle: 'File uploading',
        taskDesc: 'Uploading file to S3 Bucket',
        taskIcon: {
            name: 'ic_launcher',
            type: 'mipmap',
        },
        color: '#ff00ff',
        parameters: data,
    };

    await BackgroundService.start(veryIntensiveTask, options);
}

export async function UploadStop() {
    await BackgroundService.stop();
}
// await BackgroundService.updateNotification({taskDesc: 'New ExampleTask description'}); // Only Android, iOS will ignore this call
