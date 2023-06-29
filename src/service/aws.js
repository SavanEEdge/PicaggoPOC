// import { S3Client } from '@aws-sdk/client-s3';
// import { fromCognitoIdentityPool } from '@aws-sdk/credential-providers';
import { StorageService } from './storage_service';

export const getAWSClient = (() => {
    let client;

    return () => {
        if (!client) {
            const awsDetails = StorageService.getValue("aws");
            console.log("AWS DETAILS: ", awsDetails);
            // AWS.config.update({
            //     region: awsDetails?.region_name,
            //     credentials: new AWS.CognitoIdentityCredentials({
            //         IdentityPoolId: awsDetails?.pool_id,
            //       }),
            // });
            // client = new AWS.S3();
        }


        return client;
    };
})();