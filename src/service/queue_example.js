import reactotron from 'reactotron-react-native';
import queueFactory from '../third_party/react-native-queue';

class WorkerClass {

    UPLOAD_SERVER = 'upload_server';
    UPLOAD_S3 = 'upload_s3';

    constructor() {
        this.queue = null;
        this.initialize();
    }

    async initialize() {
        this.queue = await queueFactory();

        this.queue.addWorker(this.UPLOAD_SERVER, async (id, payload) => {
            console.log(`EXECUTING "${this.UPLOAD_SERVER}" with id:  ${id}`);
            console.log(payload, 'payload');

            await new Promise((resolve) => {
                setTimeout(() => {
                    console.log('"example-job" has completed!');
                    resolve();
                }, 500);
            });
        });

        this.queue.addWorker(this.UPLOAD_S3, async (id, payload) => {
            console.log(`EXECUTING "${this.UPLOAD_S3}" with id:  ${id}`);
            console.log(payload, 'payload');

            await new Promise((resolve) => {
                setTimeout(() => {
                    console.log('"example-job" has completed!');
                    resolve();
                }, 5000);
            });
        }, {

            onStart: async (id, payload) => {

                console.log('Job "job-name-here" with id ' + id + ' has started processing.');

            },

            // onSuccess job callback handler is fired after a job successfully completes processing.
            onSuccess: async (id, payload) => {

                console.log('Job "job-name-here" with id ' + id + ' was successful.');

            },

            // onFailure job callback handler is fired after each time a job fails (onFailed also fires if job has reached max number of attempts).
            onFailure: async (id, payload) => {

                console.log('Job "job-name-here" with id ' + id + ' had an attempt end in failure.');

            },

            // onFailed job callback handler is fired if job fails enough times to reach max number of attempts.
            onFailed: async (id, payload) => {

                console.log('Job "job-name-here" with id ' + id + ' has failed.');

            },

            // onComplete job callback handler fires after job has completed processing successfully or failed entirely.
            onComplete: async (id, payload) => {

                console.log('Job "job-name-here" with id ' + id + ' has completed processing.');

            }
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