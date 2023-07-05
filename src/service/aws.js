import { StorageService } from './storage_service';
import AWS from 'aws-sdk';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { fetchResourceFromURI, getBase64, getFileName, getVideoFileDetails, sleep } from '../utils/helper';
import reactotron from 'reactotron-react-native';
import RNFetchBlob from 'rn-fetch-blob';
// import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import ChunkUpload from '../third_party/react-native-chunk-upload';

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

            // client.upload({
            //     Body
            // })

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

export async function uploadImageToS3(filePath, Key) {
    const client = getAWSClient();
    const awsDetails = StorageService.getValue("aws");
    const file = await getBase64(filePath);

    const params = {
        Bucket: awsDetails?.bucket,
        Key,
        Body: file,
    };

    const response = await checkFileExists(Key);

    return new Promise(async (resolve, reject) => {
        try {
            if (!response.isFileExists) {
                const upload_request = client.upload(params)
                upload_request.on('httpUploadProgress', (progress) => {
                    const uploadedBytes = progress.loaded;
                    const totalBytes = progress.total;
                    const percentProgress = Math.round((uploadedBytes / totalBytes) * 100);

                    console.log(`Upload progress: ${percentProgress}%`, uploadedBytes, totalBytes);
                });
                const res = await upload_request.promise();
                console.log('Image uploaded successfully ', res);
                resolve(res);
            } else {
                resolve(response?.data);
            }

        } catch (error) {
            console.error('Error uploading image:', error);
            reject(error);
        }
    })


};

export async function uploadVideoToS3(filePath, Key) {
    const client = getAWSClient();
    const awsDetails = StorageService.getValue("aws");


    const response = await checkFileExists(Key);
    if (!response.isFileExists) {
        const fileDetails = await getVideoFileDetails(filePath);
        console.log("fileDetails", JSON.stringify(fileDetails, null, 2))

        // if (fileDetails.sizeInKB < 5000) {
        //     // upload normally
        //     console.log("Upload with blob")
        //     const file = await getBase64(filePath);
        //     const params = {
        //         Bucket: awsDetails?.bucket,
        //         Key,
        //         Body: file,
        //     };

        //     const upload_request = client.upload(params)
        //     upload_request.on('httpUploadProgress', (progress) => {
        //         const uploadedBytes = progress.loaded;
        //         const totalBytes = progress.total;
        //         const percentProgress = Math.round((uploadedBytes / totalBytes) * 100);

        //         console.log(`Upload progress: ${percentProgress}%`, uploadedBytes, totalBytes);
        //     });
        //     const res = await upload_request.promise();
        //     console.log('Image uploaded successfully ', res);
        //     resolve(res);
        // } else {
        //     // upload multipart

        //     const fs = RNFetchBlob.fs;

        //     const params = {
        //         Bucket: awsDetails?.bucket,
        //         Key,
        //     };

        //     const { UploadId } = await client.createMultipartUpload(params).promise();
        //     const fileStat = await fs.stat(filePath);
        //     const fileName = getFileName(filePath);
        //     const uploadPromises = [];
        //     const chunk = new ChunkUpload({
        //         path: filePath,
        //         size: 5242880,
        //         fileSize: fileStat.size,
        //         fileName,
        //         onFetchBlobError: (e) => console.log(e),
        //         onWriteFileError: (e) => console.log(e),
        //         onEnd: async () => {
        //             try {
        //                 const completeParams = {
        //                     ...params,
        //                     UploadId,
        //                     MultipartUpload: {
        //                         Parts: uploadPromises,
        //                     },
        //                 };
        //                 reactotron.log("completeParams", completeParams)
        //                 client.completeMultipartUpload(completeParams).promise().then(res => JSON.stringify(res, null, 2)).catch(e => console.log("Final Error ", e));
        //             } catch (e) {
        //                 console.log("Final completeMultipartUpload error ", e);
        //             }
        //         }
        //     });
        //     chunk.digIn(async (file, next) => {
        //         console.log("file", file.number);

        //         // await sleep(500);
        //         const partParams = {
        //             ...params,
        //             PartNumber: file.number,
        //             UploadId,
        //             Body: await fetchResourceFromURI(file.blob.uri),
        //         };
        //         const uploadPartPromise = await client.uploadPart(partParams).promise();
        //         console.log("uploadPartPromise", uploadPartPromise);
        //         uploadPromises.push({
        //             ETag: uploadPartPromise.ETag,
        //             PartNumber: file.number,
        //         });
        //         next();
        //     });
        // }
    }
};
