import reactotron from 'reactotron-react-native';
import queueFactory from '../third_party/react-native-queue';
import { UploadStart } from './Worker';

class WorkerClass {

    UPLOAD_SERVER = 'upload_server';
    UPLOAD_IMAGE_S3 = 'upload_img_s3';
    UPLOAD_VIDEO_S3 = 'upload_vid_s3';

    constructor() {
        this.queue = null;
        this.initialize();
    }

    async initialize() {
        this.queue = await queueFactory();

        this.queue.addWorker(this.UPLOAD_SERVER, async (id, payload) => {
            await new Promise(async (resolve) => {
                await UploadStart({ action: this.UPLOAD_SERVER, payload });
                resolve();
            });
        });

        this.queue.addWorker(this.UPLOAD_IMAGE_S3, async (id, payload) => {
            await new Promise(async (resolve) => {
                await UploadStart({ action: this.UPLOAD_IMAGE_S3, payload });
                resolve();
            });
        });

        this.queue.addWorker(this.UPLOAD_VIDEO_S3, async (id, payload) => {
            await new Promise(async (resolve) => {
                await UploadStart({ action: this.UPLOAD_VIDEO_S3, payload });
                resolve();
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