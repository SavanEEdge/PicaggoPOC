import BackgroundService from 'react-native-background-actions';
import reactotron from 'reactotron-react-native';
import { Worker } from './queue';
import { deleteFileFromS3, uploadInS3 } from './aws';
import { DBInstance } from './realm';
import api from '../api';
import { deleteFile } from '../utils/helper';

const uploadTask = async (taskDataArguments) => {
    const { action, payload } = taskDataArguments;
    if (action == Worker.UPLOAD_SERVER) {
        try {
            const { requestBody, headers, filePath } = payload;
            const { id, ...rest } = requestBody;
            const response = await api.post("https://sdrobz9xp1.execute-api.us-west-1.amazonaws.com/add_live_media_data", rest, headers);
            if (response.status) {
                const dbMedia = DBInstance.objects('media').filtered(`id=="${id}"`)[0];
                if (dbMedia) {
                    DBInstance.write(() => {
                        dbMedia.isUploaded = true;
                    })
                }
                if (requestBody.mime_type == 'video/mp4') {
                    deleteFile(filePath);
                }
            }
        } catch (e) {
            console.log("Media Upload error: ", e);
        }
    } else if (action == Worker.UPLOAD_S3) {
        try {
            await uploadInS3(payload.path, payload.key, payload.id);
        } catch (e) {
            console.log("S3 Upload error: ", e);
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

    await BackgroundService.start(uploadTask, options);
}

export async function UploadStop() {
    await BackgroundService.stop();
}
// await BackgroundService.updateNotification({taskDesc: 'New ExampleTask description'}); // Only Android, iOS will ignore this call
