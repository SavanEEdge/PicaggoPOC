import { StorageService } from './storage_service';
import AWS from 'aws-sdk';
import { NativeModules } from 'react-native';
import { deleteFile } from '../utils/helper';
import { DBInstance } from './realm';

export const getAWSClient = (() => {
    let client;

    return () => {
        if (!client) {
            const awsDetails = StorageService.getValue("aws");
            const firebaseToken = StorageService.getValue("FToken");
            console.log("AWS DETAILS: ", awsDetails);
            AWS.config.update({
                region: awsDetails?.region_name,
                credentials: new AWS.CognitoIdentityCredentials({
                    IdentityPoolId: awsDetails?.pool_id,
                    Logins: {
                        'securetoken.google.com/picaggo-235807': firebaseToken
                    }
                }),
            });
            client = new AWS.S3({
                params: { Bucket: awsDetails?.bucket },
                region: awsDetails?.region_name
            });
        }


        return client;
    };
})();


export async function checkFileExists(Key) {
    const client = getAWSClient();
    const awsDetails = StorageService.getValue("aws");
    const params = {
        Bucket: awsDetails?.bucket,
        Key,
    };

    try {
        const res = await client?.headObject(params).promise();
        console.log('File exists ', res);
        return { isFileExists: true, data: res };
    } catch (error) {
        if (error.code === 'NotFound') {
            console.log('File does not exist');
            return { isFileExists: false };
        } else {
            console.error('Error checking file existence:', error);
            throw error;
        }
    }
};

export async function deleteFileFromS3(Key) {
    const client = getAWSClient();
    const awsDetails = StorageService.getValue("aws");
    const params = {
        Bucket: awsDetails?.bucket,
        Key,
    };

    try {
        const res = await client.deleteObject(params).promise();
        console.log('File deleted successfully ', res);
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

export async function uploadInS3(filePath, Key, dbId) {
    const response = await checkFileExists(Key);
    if (!response.isFileExists) {
        const awsDetails = StorageService.getValue("aws");
        const firebaseToken = StorageService.getValue("FToken");
        const S3TransferUitility = NativeModules.AWSRNS3TransferUtility;
        const isTransferUitilityInit = await S3TransferUitility.initWithOptions({
            region: awsDetails?.region_name,
            poll_id: awsDetails?.pool_id,
            google_jwt_token: firebaseToken,
        });
        console.log("isTransferUitilityInit ", isTransferUitilityInit);
        const requestid = await S3TransferUitility.createUploadRequest({
            bucket: awsDetails?.bucket,
            key: Key,
            path: filePath,
            subscribe: true,
            completionhandler: true,
        })
        console.log("requestid ", requestid);
        if (isTransferUitilityInit) {
            try {
                const data = await S3TransferUitility.upload({ requestid });
                const dbMedia = DBInstance.objects('media').filtered(`id=="${dbId}"`)[0];
                if (dbMedia) {
                    DBInstance.write(() => {
                        dbMedia.isUploaded = true;
                    })
                }
                if (/\/compressed\//.test(Key)) {
                    deleteFile(filePath);
                }
            } catch (e) {
                console.log("Error: ", error);
            }
        }
    }
};
