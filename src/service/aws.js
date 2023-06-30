import { StorageService } from './storage_service';
import AWS from 'aws-sdk';
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