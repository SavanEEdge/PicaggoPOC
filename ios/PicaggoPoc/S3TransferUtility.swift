import AWSS3
import AWSCore
import AWSCognito
import AWSCognitoIdentityProviderASF

@objc(S3TransferUtilityV2)
class S3TransferUtilityV2: NSObject {
    
    var requestMap: [String: [String: Any]] = [:];
    @objc(initWithOptions:withResolver:withRejecter:)
    func initWithOptions(_ params: NSDictionary, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        if let region = params["ios_region"]{
            if let poll_id = params["poll_id"]{
                if let google_jwt_token = params["google_jwt_token"] as? NSString{
                    let AWS_region =  AWSRegionType.init(rawValue: region as! Int) ?? AWSRegionType.USWest1;
                    let logins = ["securetoken.google.com/picaggo-235807" as NSString: google_jwt_token];
                    let customProviderManager = CustomIdentityProvider(tokens: logins)
                    let credentialsProvider = AWSCognitoCredentialsProvider(regionType: AWS_region,
                                                                            identityPoolId: poll_id as! String, identityProviderManager: customProviderManager);
                    let configuration = AWSServiceConfiguration(region:AWS_region, credentialsProvider:credentialsProvider)
                    if let serviceManager = AWSServiceManager.default(){
                        serviceManager.defaultServiceConfiguration = configuration;
                        print("aws config set");
                        resolve(true);
                    }else{
                        print("aws config could not set");
                        resolve(false);
                    }
                }  else {
                    reject("NOT_FOUND","Google JWT Token is not provided!", nil)
                }
            } else {
                reject("NOT_FOUND","Poll id is not provided!", nil)
            }
        } else {
            reject("NOT_FOUND","Region Token is not provided!", nil)
        }
    }
    
    @objc(checkFile:withResolver:withRejecter:)
    public func checkFile(_ params: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock){
        if let butcket = params["bucket"] as? String{
            if let key = params["key"] as? String{
                if let headObjectsRequest = AWSS3HeadObjectRequest(){
                    headObjectsRequest.bucket = butcket;
                    headObjectsRequest.key = key;
                    print("Checking file exists in s3: \(key)");
                    AWSS3.default().headObject(headObjectsRequest).continueWith(block: {(task) -> AnyObject?  in
                        if let error = task.error {
                            print("Error to find file: \(error)")
                            resolve(false);
                        } else {
                            let result = task.result;
                            let ContentLength = result?.contentLength;
                            let ContentType = result?.contentType;
                            let ETag = result?.eTag;
                            let LastModified = result?.lastModified;
                            let Metadata = result?.metadata;
                            let ReplicationStatus = result?.replicationStatus;
                            let ServerSideEncryption = result?.serverSideEncryption;
                            let VersionId = result?.versionId;
                            let isFileExists = true;
                            
                            let jsonObject: [String: Any]  = [
                                     "ContentLength": ContentLength as Any,
                                     "ContentType": ContentType as Any,
                                     "ETag": ETag as Any,
                                     "LastModified": LastModified as Any,
                                     "Metadata": Metadata as Any,
                                     "ReplicationStatus": ReplicationStatus as Any,
                                     "ServerSideEncryption": ServerSideEncryption as Any,
                                     "VersionId": VersionId as Any,
                                     "isFileExists": isFileExists as Any,
                                ]
                            resolve(jsonObject);
                        }
                        return nil
                    })
                } else {
                    reject("NOT_FOUND", "Heade Request not found!", nil);
                }
            }else {
                reject("NOT_FOUND", "key is not provided!", nil);
            }
        }else {
            reject("NOT_FOUND", "bucket is not provided!", nil);
        }
    }
    
    @objc(createUploadRequest:withResolver:withRejecter:)
    public func createUploadRequest(_ params: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock){
        guard let bucket = params["bucket"] as? String else {
            reject("NOT_FOUND", "bucket is not provided!", nil);
            return;
        }
        guard let key = params["key"] as? String else {
            reject("NOT_FOUND", "key is not provided!", nil);
            return;
        }
        guard let path = params["path"] as? String else {
            reject("NOT_FOUND", "path is not provided!", nil);
            return;
        }
        guard let mime_type = params["mime_type"] as? String else {
            reject("NOT_FOUND", "mime_type is not provided!", nil);
            return;
        }
        guard let event_id = params["event_id"] as? String else {
            reject("NOT_FOUND", "event_id is not provided!", nil);
            return;
        }
        guard let user_id = params["user_id"] as? String else {
            reject("NOT_FOUND", "user_id is not provided!", nil);
            return;
        }
        
        let map: [String: Any] = [
            "bucket": bucket,
            "key": key,
            "path": path,
            "mime_type": mime_type,
            "event_id": event_id,
            "user_id": user_id,
            "subscribe": params["subscribe"] as? Bool ?? true,
            "completionhandler": params["completionhandler"] as? Bool ?? true,
        ]
        
        let uuid = NSUUID().uuidString
        requestMap[uuid] = map;
        resolve(uuid);
    }
    
    @objc(upload:withResolver:withRejecter:)
    public func upload(_ params: NSDictionary, resolve: @escaping RCTPromiseResolveBlock, reject:RCTPromiseRejectBlock){
        guard let requestId = params["requestId"] as? String else {
            reject("NOT_FOUND", "requestId is not provided!", nil);
            return;
        }
        
        let map = requestMap[requestId];
        
        let bucket = map?["bucket"] as! String ;
        let key = map?["key"] as! String ;
        let path = map?["path"] as! String ;

        let mime_type = map?["mime_type"] as! String ;
        let event_id = map?["event_id"] as! String ;
        let user_id = map?["user_id"] as! String ;

        guard let fileURL = URL(string: path) else {
            return;
        }
        
         let expression = AWSS3TransferUtilityUploadExpression()
         expression.progressBlock = {(task, progress) in
             print("aws Progess single: \(progress) val: \(Float(progress.fractionCompleted))")
         }
         expression.setValue(event_id, forRequestParameter: "x-amz-meta-event_id")
         expression.setValue(user_id, forRequestParameter: "x-amz-meta-user_id")
         AWSS3TransferUtility.default().uploadFile(fileURL, bucket: bucket, key: key , contentType: mime_type, expression: expression, completionHandler: { (task, error) -> Void in
             print(task)
         }).continueWith { (task) -> AnyObject? in
             if let error = task.error {
                 print("aws single 2 Error: \(error)")
             }
             if let _ = task.result {
                    resolve(true)
                 print("aws single Upload Starting!")
             }
             return nil
         }

//        let expression = AWSS3TransferUtilityMultiPartUploadExpression()
//        expression.progressBlock = {(task, progress) in
//            print("aws Progess multi : \(progress) val: \(Float(progress.fractionCompleted))")
//        }
//        let transferManager = AWSS3TransferUtility.default()
//
//        print("aws config: \(transferManager.configuration)")
//        transferManager.uploadUsingMultiPart(fileURL: fileURL, bucket: bucket, key: key, contentType: mime_type, expression: expression, completionHandler: { (task, error) -> Void in
//            if ((error) != nil){
//                print("aws multi Failed with error")
//                print("aws multi 1 Error: \(error!)");
//            }else{
//                print("aws multi Success")
//            }
//        }).continueWith { (task) -> AnyObject? in
//            if let error = task.error {
//                print("aws multi Error: \(error)")
//            }
//            if let _ = task.result {
//                resolve(true)
//                print("aws multi Upload Starting!")
//            }
//            return nil;
//        }
    }
    
    func toString(_ value: Any?) -> String {
        return String(describing: value ?? "")
    }
    
    class CustomIdentityProvider: NSObject, AWSIdentityProviderManager{
            var tokens : [NSString : NSString]!
            init(tokens: [NSString : NSString]) {
                self.tokens = tokens
            }
            @objc func logins() -> AWSTask<NSDictionary> {
                return AWSTask(result: tokens as NSDictionary?) as! AWSTask<NSDictionary>
            }
        }
}
