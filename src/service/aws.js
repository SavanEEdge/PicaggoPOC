import {StorageService} from './storage_service';
import {deleteFile} from '../utils/helper';
import {DBInstance} from './realm';
import {S3TransferUtility} from './aws_transfer_service';

export async function checkFileExists(Key) {
  try {
    const awsDetails = StorageService.getValue('aws');
    const firebaseToken = StorageService.getValue('FToken');
    const region = awsDetails?.region_name;
    const ios_region = awsDetails?.region;
    const poll_id = awsDetails?.pool_id;
    const bucket = awsDetails?.bucket;
    const google_jwt_token = firebaseToken;
    const s3Client = S3TransferUtility.getInstance();
    await s3Client.initWithOptions({
      region,
      poll_id,
      google_jwt_token,
      ios_region,
    });
    console.log('File to be check ', Key);
    const res = await s3Client.checkFile({bucket, key: Key});
    return res;
  } catch (error) {
    if (error.code === 'NotFound') {
      console.log('File does not exist');
      return {isFileExists: false};
    } else {
      console.error('Error checking file existence:', error);
      throw error;
    }
  }
}

export async function deleteFileFromS3(Key) {
  try {
    const awsDetails = StorageService.getValue('aws');
    const firebaseToken = StorageService.getValue('FToken');
    const region = awsDetails?.region_name;
    const ios_region = awsDetails?.region;
    const poll_id = awsDetails?.pool_id;
    const bucket = awsDetails?.bucket;
    const google_jwt_token = firebaseToken;
    const s3Client = S3TransferUtility.getInstance();
    await s3Client.initWithOptions({
      region,
      poll_id,
      google_jwt_token,
      ios_region,
    });
    await s3Client.deleteFile({bucket, key: Key});
    console.log('File deleted successfully ');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

export async function uploadInS3({
  filePath,
  Key,
  dbId,
  event_id,
  user_id,
  mime_type,
}) {
  const response = await checkFileExists(Key);
  if (!response.isFileExists) {
    const awsDetails = StorageService.getValue('aws');
    const firebaseToken = StorageService.getValue('FToken');
    const region = awsDetails?.region_name;
    const ios_region = awsDetails?.region;
    const poll_id = awsDetails?.pool_id;
    const bucket = awsDetails?.bucket;

    const google_jwt_token = firebaseToken;
    const s3Client = S3TransferUtility.getInstance();
    await s3Client.initWithOptions({
      region,
      poll_id,
      google_jwt_token,
      ios_region,
    });

    const requestId = await s3Client.createUploadRequest({
      bucket: bucket,
      key: Key,
      path: filePath,
      event_id,
      mime_type,
      user_id,
      subscribe: true,
      completionhandler: true,
    });
    console.log('requestId ', requestId);
    try {
      const data = await s3Client.upload({requestId});
      // const dbMedia = DBInstance.objects('media').filtered(`id=="${dbId}"`)[0];
      // if (dbMedia) {
      //   DBInstance.write(() => {
      //     dbMedia.isUploaded = true;
      //   });
      // }
      if (/\/compressed\//.test(Key)) {
        deleteFile(filePath);
      }
    } catch (e) {
      console.log('Error: ', e);
    }
  } else {
    // console.log('File: ', JSON.stringify(response, null, 2));
  }
}
