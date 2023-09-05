import {useDispatch} from 'react-redux';
import api from '../api';
import queueFactory from '../third_party/react-native-queue';
import {uploadInS3} from './aws';
import {DBInstance} from './realm';
import {updateUploadStatus} from '../redux/slices/media';
import { deleteFile } from '../utils/helper';

class WorkerClass {
  UPLOAD_SERVER = 'upload_server';
  UPLOAD_S3 = 'UPLOAD_S3';
  dispatch;

  constructor() {
    this.queue = null;
    this.initialize();
  }

  async initialize() {
    this.queue = await queueFactory();

    this.queue.addWorker(this.UPLOAD_SERVER, async (id, payload) => {
      await new Promise(async (resolve, reject) => {
        try {
          const {requestBody, headers, filePath} = payload;
          const {id, ...rest} = requestBody;
          const response = await api.post(
            'https://sdrobz9xp1.execute-api.us-west-1.amazonaws.com/add_live_media_data',
            rest,
            headers,
          );

          if (response.status) {
            const dbMedia = DBInstance.objects('media').filtered(
              `id=="${id}"`,
            )[0];
            if (dbMedia) {
              this.dispatch?.(updateUploadStatus({id, isUploaded: true}));
              DBInstance.write(() => {
                dbMedia.isUploaded = true;
              });
            }
            if (requestBody.mime_type == 'video/mp4') {
              deleteFile(filePath);
            }
          }
          resolve();
        } catch (e) {
          console.log('Media Upload error: ', e);
          reject(e);
        }
      });
    });

    this.queue.addWorker(this.UPLOAD_S3, async (id, payload) => {
      await new Promise(async (resolve, reject) => {
        try {
          await uploadInS3({
            filePath: payload.path,
            Key: payload.key,
            dbId: payload.id,
            event_id: payload.event_id,
            user_id: payload.user_id,
            mime_type: payload.mime_type,
          });
          resolve();
        } catch (e) {
          console.log('S3 Upload error: ', e);
          reject(e);
        }
      });
    });
  }

  async addJob(jobName, jobPayload, options = {}, startImmediately = true) {
    if (!this.queue) {
      await this.initialize();
    }
    this.queue.createJob(jobName, jobPayload, options, startImmediately);
  }
}

export const Worker = new WorkerClass();
