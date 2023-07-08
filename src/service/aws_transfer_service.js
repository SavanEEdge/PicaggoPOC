import { Platform, NativeModules, NativeAppEventEmitter, DeviceEventEmitter } from 'react-native';

const s3Client = NativeModules.AWSRNS3TransferUtility;
let listener;

if (Platform.OS === 'ios') {
    listener = NativeAppEventEmitter;
} else {
    listener = DeviceEventEmitter;
}

export class AWSS3TransferUtility {
    constructor() {
        // listener.addListener("ProgressEventUtility", async (event) => {
        //     this.progressEvent(
        //         event.requestid,
        //         event.completedunitcount,
        //         event.totalunitcount,
        //         event.fractionCompleted,
        //         event.type
        //     );
        // });

        // listener.addListener("CompletionHandlerEvent", async (event) => {
        //     this.completionHandlerEvent(event.requestid, event.error, event.request);
        // });
    }

    /*
    * The completion feedback block.
    * @param {string} requestid
    * @param {map} error
    * @param {map} request
    * @example
    * InstanceOfAWSS3TransferUtility.completionHandlerEvent = function(requestid,error,request){
    *     console.log("Request ID: " + requestid)
    *     console.log("error: " + error)
    *     console.log("request: " + request)
    * }
    */
    completionHandlerEvent(requestid, error, request) {
    }

    /*
    * Constructs a new TransferUtility specifying the region
    * @param {string} region - the S3 bucket location
    * @param {string} poll_id - identity_pool_id
    * @param {string} google_jwt_token - google authentication Token;
    * @example
    * InstanceOfAWSS3TransferUtility.initWithOptions({"region":"bucketRegion", "poll_id": "adjsd-asdbajd-asdasdj",google_jwt_token: "google token" })
    */
    async initWithOptions(options) {
        if (!options.region || options.region == '') {
            console.error("undefined region field")
            return;
        }
        if (!options.poll_id || options.poll_id == '') {
            console.error("undefined poll_id field")
            return;
        }
        if (!options.google_jwt_token || options.google_jwt_token == '') {
            console.error("undefined google_jwt_token field")
            return;
        }

        await s3Client.initWithOptions(options);
    }

    /*
    * Creates a upload request and returns an ID to represent a upload task.
    * @param {string} bucket - the bucket name
    * @param {string} key - the object key
    * @param {string} path - the object's current path for android and uri for iOS
    * @param {boolean} subscribe - set to true to recieve events to ProgressEventUtility
    * @param {boolean} completionhandler - set to true to recieve events to CompletionHandlerEvent
    * return requestID
    */
    async createUploadRequest(options) {
        if (!options.bucket || options.bucket == '') {
            console.error("undefined bucket field")
            return;
        }
        if (!options.key || options.key == '') {
            console.error("undefined key field")
            return;
        }
        if (!options.path || options.path == '') {
            console.error("undefined path field")
            return;
        }
        options.subscribe = options?.subscribe ?? true;
        options.completionhandler = options?.completionhandler ?? true;

        const requestID = await s3Client.createUploadRequest(options);
        return requestID;
    }

    /*
    * Uploads the file to the specified Amazon S3 bucket.
    * @param {string} requestid - the request id obtained from createUploadRequest.
    * @example
    * async function upload(){
    *   try{
    *     var val = await InstanceOfAWSS3TransferUtility.upload({"requestid":value});
    *   }catch(e){
    *     console.log("upload failed: " + e)
    *   }
    * }
    * upload();
    * @returns {map} request
    */
    async upload(requestID) {
        if (!requestID || requestID == "") {
            console.error("undefined requestID field")
            return;
        }
        const returned = await s3Client.upload({ requestID });
        return returned;
    }


    async deleteFile(options) {
        if (!options.bucket || options.bucket == '') {
            console.error("undefined bucket field")
            return;
        }
        if (!options.key || options.key == '') {
            console.error("undefined key field")
            return;
        }
        await s3Client.deleteFile(options);
    }


    async checkFile(options) {
        if (!options.bucket || options.bucket == '') {
            console.error("undefined bucket field")
            return;
        }
        if (!options.key || options.key == '') {
            console.error("undefined key field")
            return;
        }
        await s3Client.checkFile(options);
    }
}