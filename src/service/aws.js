import { StorageService } from './storage_service';
import AWS from 'aws-sdk';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { fetchResourceFromURI, getBase64 } from '../utils/helper';
import reactotron from 'reactotron-react-native';
import RNFetchBlob from 'rn-fetch-blob';
// import AWS from 'aws-sdk/dist/aws-sdk-react-native';

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

        const fs = RNFetchBlob.fs;
        const { Readable } = RNFetchBlob.polyfill;

        const params = {
            Bucket: awsDetails?.bucket,
            Key,
        };

        const { UploadId } = await client.createMultipartUpload(params).promise();

        // const fileStat = await fs.stat(filePath);
        // const fileSize = fileStat.size;
        // const partSize = 5 * 1024 * 1024; // 5MB per part (adjust as needed)
        // const totalParts = Math.ceil(fileSize / partSize);
        // const uploadPromises = [];
        // for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        //     const start = (partNumber - 1) * partSize;
        //     const end = Math.min(start + partSize, fileSize);
        //     const partParams = {
        //         ...params,
        //         PartNumber: partNumber,
        //         UploadId,
        //     };
        //     const readStream = await fs.readStream(filePath, 'base64', start, end);
        //     const partBody = new Readable();
        //     partBody._read = () => { };
        //     readStream.open();
        //     readStream.onData((chunk) => {
        //         partBody.push(chunk);
        //     });
        //     readStream.onError((err) => {
        //         console.error('Error reading video stream:', err);
        //         partBody.destroy(err);
        //     })
        //     readStream.onEnd(() => {
        //         partBody.push(null);
        //     })

        //     partParams.Body = partBody;
        //     const uploadPartPromise = s3.uploadPart(partParams).promise();
        //     console.log("uploadPartPromise", uploadPartPromise);
        //     uploadPromises.push(uploadPartPromise);
        // }
        const uploadedParts = await Promise.all(uploadPromises);
        reactotron.log("uploadedParts", uploadedParts);


        // RNFetchBlob.fs.readStream(filePath, 'base64', 5 * 1024 * 1024).then((streamReader) => {

        //     streamReader.open();

        //     streamReader.onData(async (chunk) => {
        //         try {
        //             const partParams = {
        //                 Bucket: awsDetails?.bucket,
        //                 Key,
        //                 PartNumber: partNumber,
        //                 UploadId,
        //                 Body: chunk,
        //             };
        //             console.log("partNumber ", partNumber, UploadId);
        //             const upload_request = await client.uploadPart(partParams);
        //             upload_request.on('httpUploadProgress', (progress) => {
        //                 const uploadedBytes = progress.loaded;
        //                 const totalBytes = progress.total;
        //                 const percentProgress = Math.round((uploadedBytes / totalBytes) * 100);

        //                 console.log(`Upload progress: ${percentProgress}%`, uploadedBytes, totalBytes);
        //             });
        //             const uploadPartResponse = await upload_request.promise();

        //             console.log("uploadPartResponse", uploadPartResponse);
        //             uploadPartRes.push(uploadPartResponse);
        //             partNumber += 1;
        //         } catch (e) {
        //             console.log("Part Upload Error ", e)
        //         }

        //     })

        //     streamReader.onError((err) => {
        //         partNumber = 1;
        //         reject(err);
        //     })

        //     streamReader.onEnd(async () => {
        //         partNumber = 1;
        //         reactotron.log("uploadedParts", uploadPartRes);

        //         resolve();
        //     });
        // });




        // const uploadResults = await Promise.all(uploadPromises);
        // const res = client.completeMultipartUpload()
    }




};

// return new Promise(async (resolve, reject) => {
                    //     try {

                    //         const upload_request = client.upload(params)
                    //         upload_request.on('httpUploadProgress', (progress) => {
                    //             const uploadedBytes = progress.loaded;
                    //             const totalBytes = progress.total;
                    //             const percentProgress = Math.round((uploadedBytes / totalBytes) * 100);

                    //             console.log(`Upload progress: ${percentProgress}%`, uploadedBytes, totalBytes);
                    //         });
                    //         const res = await upload_request.promise();
                    //         console.log('Video uploaded Chunk ', res);


                    //     } catch (error) {
                    //         console.error('Error uploading video:', error);
                    //         reject(error);
                    //     }
                    // })