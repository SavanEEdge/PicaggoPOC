import Foundation
import AWSS3
import AWSCore
import AWSCognito
import AWSCognitoIdentityProviderASF
import Photos
import SDWebImageWebPCoder

class AWSCustomService{
    
    static let instance = AWSCustomService()
    private init(){
        if !Defaults.getAWSConfigSet(){
            configure()
        }
    }
    
    public func configure(){
        Accounts().findRegion(config: {(json) in
            DataSource.getJWTToken(authToken: {(token, error) in
                guard let token = token, error == nil else {
                    Defaults.resetValues()
                    (UIApplication.shared.delegate as! AppDelegate).loadLogin()
                    print("firebase jwt auth error: \(error?.localizedDescription ?? "nil")")
                    return
                }
                if json.keys.contains("region"){
                    Defaults.setBucket(value: json["bucket"] as! String)
                    let region = AWSRegionType.init(rawValue: json["region"] as! Int) ?? AWSRegionType.USWest1
                    let logins = ["securetoken.google.com/picaggo-235807" as NSString: token as NSString]
                    let customProviderManager = CustomIdentityProvider(tokens: logins)
                    let credentialsProvider = AWSCognitoCredentialsProvider(regionType:region,
                                                                            identityPoolId:json["pool_id"] as! String, identityProviderManager: customProviderManager)
                    let configuration = AWSServiceConfiguration(region:region, credentialsProvider:credentialsProvider)
                    if let serviceManager = AWSServiceManager.default(){
                        serviceManager.defaultServiceConfiguration = configuration
                        print("aws config set")
                        Defaults.setAWSConfigSet(status: true)
                    }else{
                        print("aws config could not set")
                        Defaults.setAWSConfigSet(status: false)
                    }
                }
            })
        })
    }
    
    public func configure(success: @escaping(Bool) -> ()){
        Accounts().findRegion(config: {(json) in
            CustomLog.instance.addLog(tag: String(describing: type(of: self)), text: "findRegion response: \(json)", type: .debug, module: .upload)
            DataSource.getJWTToken(authToken: {(token, error) in
                guard let token = token, error == nil else {
                    Defaults.resetValues()
                    (UIApplication.shared.delegate as! AppDelegate).loadLogin()
                    print("firebase jwt auth error: \(error?.localizedDescription ?? "nil")")
                    CustomLog.instance.addLog(tag: String(describing: type(of: self)), text: "firebase jwt auth error: \(error?.localizedDescription ?? "nil")", type: .error, module: .upload)
                    success(false)
                    return
                }
                if json.keys.contains("region"){
                    Defaults.setBucket(value: json["bucket"] as! String)
                    let region = AWSRegionType.init(rawValue: json["region"] as! Int) ?? AWSRegionType.USWest1
                    let logins = ["securetoken.google.com/picaggo-235807" as NSString: token as NSString]
                    let customProviderManager = CustomIdentityProvider(tokens: logins)
                    let credentialsProvider = AWSCognitoCredentialsProvider(regionType:region,
                                                                            identityPoolId:json["pool_id"] as! String, identityProviderManager: customProviderManager)
                    let configuration = AWSServiceConfiguration(region:region, credentialsProvider:credentialsProvider)
                    if let serviceManager = AWSServiceManager.default(){
                        serviceManager.defaultServiceConfiguration = configuration
                        print("aws config set")
                        CustomLog.instance.addLog(tag: String(describing: type(of: self)), text: "aws config set", type: .debug, module: .upload)
                        Defaults.setAWSConfigSet(status: true)
                        success(true)
                    }else{
                        print("aws config could not set")
                        CustomLog.instance.addLog(tag: String(describing: type(of: self)), text: "aws config could not set", type: .error, module: .upload)
                        Defaults.setAWSConfigSet(status: false)
                        success(false)
                    }
                }
            })
        })
    }
    
    public func uploadLogFile(url: URL, key: String, result: @escaping(Bool, Error?, Bool) -> ()){
        let bucket = Defaults.getBucket()
        let expression = AWSS3TransferUtilityUploadExpression()
        expression.progressBlock = {(task, progress) in
            print("aws Progess single: \(progress) val: \(Float(progress.fractionCompleted))")
        }
        let fileURL = URL.init(fileURLWithPath: url.path)
        let fileKey = key + "/" + url.lastPathComponent
        AWSS3TransferUtility.default().uploadFile(fileURL, bucket: bucket, key: fileKey, contentType: "text/plain", expression: expression, completionHandler: { (task, error) -> Void in
            DispatchQueue.main.async(execute: {
                if error == nil {
                    let awsurl = AWSS3.default().configuration.endpoint.url
                    let publicURL = awsurl?.appendingPathComponent(bucket).appendingPathComponent(url.lastPathComponent)
                    print("Uploaded to:\(String(describing: publicURL))")
                    do {
                        try FileManager.default.removeItem(at: url)
                        print("File deleted successfully. \(url)")
                    } catch {
                        print("Error deleting file: \(error)")
                    }
                    result(true, nil, false)
                } else {
                    print("aws image error: \(error)")
                    result(false, error, false)
                }
            })
        }).continueWith { (task) -> AnyObject? in
            if let error = task.error {
                print("aws single 2 Error: \(error)")
                result(false, error, true)
            }
            if let _ = task.result {
                print("aws single Upload Starting!")
            }
            return nil
        }
    }
    
    public func uploadFile(url: URL, subKey: String, mimeType: String, name: String, event_id: String, location_id: String, id: String, result: @escaping(Bool, Error?, Bool) -> ()){
        DispatchQueue.global(qos: .utility).async{
            let key = "events/\(location_id)/\(subKey)/\(name)"
            let bucket = Defaults.getBucket()
            self.doesFileExists(key: key, onComplete: {(exists, error, size) in
                print("file: \(key) exists: \(exists) error: \(error)")
                if exists{
                    if subKey == "compressed"{
                        Database.instance.updateUploadProgress(eventId: event_id, id: id, progress: 0.0, subKey: subKey, mime: mimeType)
                    }
                    result(true, nil, false)
                }else{
                    print("AWS url \(url) size: \(url.fileSize) mimeType: \(mimeType)")
                    if url.fileSize > 100000000{
                        let expression = AWSS3TransferUtilityMultiPartUploadExpression()
                        expression.progressBlock = {(task, progress) in
                            print("aws Progess multi : \(progress) val: \(Float(progress.fractionCompleted))")
                            Database.instance.updateUploadProgress(eventId: event_id, id: id, progress: progress.fractionCompleted, subKey: subKey, mime: mimeType)
                        }
                        let transferManager = AWSS3TransferUtility.default()
                        
                        print("aws config: \(transferManager.configuration)")
                        transferManager.uploadUsingMultiPart(fileURL: url, bucket: bucket, key: key, contentType: mimeType, expression: expression, completionHandler: { (task, error) -> Void in
                            if ((error) != nil){
                                print("aws multi Failed with error")
                                print("aws multi 1 Error: \(error!)");
                                Database.instance.updateUploadProgress(eventId: event_id, id: id, progress: 0.0, subKey: subKey, mime: mimeType)
                                result(false, error, false)
                            }else{
                                if subKey == "compressed"{
                                    Database.instance.updateUploadProgress(eventId: event_id, id: id, progress: 0.0, subKey: subKey, mime: mimeType)
                                }
                                print("aws multi Success")
                                result(true, nil, false)
                            }
                        }).continueWith { (task) -> AnyObject? in
                            if let error = task.error {
                                print("aws multi Error: \(error)")
                                result(false, error, true)
                            }
                            if let _ = task.result {
                                print("aws multi Upload Starting!")
                            }
                            return nil;
                        }
                    }else if url.fileSize > 0{
                        let expression = AWSS3TransferUtilityUploadExpression()
                        expression.progressBlock = {(task, progress) in
                            print("aws Progess single: \(progress) val: \(Float(progress.fractionCompleted))")
                            Database.instance.updateUploadProgress(eventId: event_id, id: id, progress: progress.fractionCompleted, subKey: subKey, mime: mimeType)
                            
                        }
                        expression.setValue(event_id, forRequestParameter: "x-amz-meta-event_id")
                        expression.setValue(Defaults.getUserId(), forRequestParameter: "x-amz-meta-user_id")
                        AWSS3TransferUtility.default().uploadFile(fileURL, bucket: bucket, key: key, contentType: mimeType, expression: expression, completionHandler: { (task, error) -> Void in
                            DispatchQueue.main.async(execute: {
                                if error == nil {
                                    let url = AWSS3.default().configuration.endpoint.url
                                    let publicURL = url?.appendingPathComponent(bucket).appendingPathComponent(name)
                                    print("Uploaded to:\(String(describing: publicURL))")
                                    if subKey == "compressed"{
                                        Database.instance.updateUploadProgress(eventId: event_id, id: id, progress: 0.0, subKey: subKey, mime: mimeType)
                                    }
                                    result(true, nil, false)
                                } else {
                                    Database.instance.updateUploadProgress(eventId: event_id, id: id, progress: 0.0, subKey: subKey, mime: mimeType)
                                    print("aws image error: \(error)")
                                    result(false, error, false)
                                }
                            })
                        }).continueWith { (task) -> AnyObject? in
                            if let error = task.error {
                                print("aws single 2 Error: \(error)")
                                result(false, error, true)
                            }
                            if let _ = task.result {
                                print("aws single Upload Starting!")
                            }
                            return nil
                        }
                    }else{
                        print("file size is zero, compress again")
                        result(false, nil, false)
                    }
                }
            })
        }
    }
    
    public func uploadDataFile(url: URL, result: @escaping(Bool, Error?, Bool) -> ()){
        DispatchQueue.global(qos: .utility).async{
            let key = "local_data/\(Defaults.getUserId())/\(url.lastPathComponent)"
            let bucket = Defaults.getBucket()
            self.doesFileExists(key: key, onComplete: {(exists, error, size) in
                print("file: \(key) exists: \(exists) error: \(error)")
                if exists{
                    result(true, nil, false)
                }else{
                    let expression = AWSS3TransferUtilityUploadExpression()
                    expression.progressBlock = {(task, progress) in
                        print("aws json Progess single: \(progress) val: \(Float(progress.fractionCompleted))")
                    }
                    let fileURL = URL.init(fileURLWithPath: url.path)
                    AWSS3TransferUtility.default().uploadFile(fileURL, bucket: bucket, key: key, contentType: "application/json", expression: expression, completionHandler: { (task, error) -> Void in
                        DispatchQueue.main.async(execute: {
                            if error == nil {
                                let _url = AWSS3.default().configuration.endpoint.url
                                let publicURL = _url?.appendingPathComponent(bucket).appendingPathComponent(url.lastPathComponent)
                                print("Uploaded to:\(String(describing: publicURL))")
                                result(true, nil, false)
                            } else {
                                print("aws json error: \(error)")
                                result(false, error, false)
                            }
                        })
                    }).continueWith { (task) -> AnyObject? in
                        if let error = task.error {
                            print("aws single 2 Error: \(error)")
                            result(false, error, true)
                        }
                        if let _ = task.result {
                            print("aws single Upload Starting!")
                        }
                        return nil
                    }
                }
            })
        }
    }
    
    public func doesFileExists(key: String, onComplete: @escaping(Bool, Error?, Int) -> ()){
        if let headObjectsRequest = AWSS3HeadObjectRequest(){
            headObjectsRequest.bucket = Defaults.getBucket()
            headObjectsRequest.key = key
            print("Checking file exists in s3: \(key)")
            AWSS3.default().headObject(headObjectsRequest).continueWith(block: {(task) -> AnyObject?  in
                if let error = task.error {
                    print("Error to find file: \(error)")
                    onComplete(false,error, 0)
                } else {
                    print("fileExist: \(task.result?.contentLength)")
                    if let size = task.result?.contentLength{
                        onComplete(true, nil, Int(size))
                    }else{
                        onComplete(true, nil, 0)
                    }
                }
                return nil
            })
        }else{
            onComplete(false, nil, 0)
        }
    }

    public func getData(source_url: URL, mimeType: GalleryPhotos.mimeType, FileData: @escaping(Data?) -> ()){
        if mimeType == .image{
            SDWebImageManager.shared.loadImage(with: source_url, options: .continueInBackground, progress: nil, completed: {(image, data, error, cacheType, finished, imageURL) in
                if finished{
                    if let image = image{
                        let d = image.sd_imageData()
                        FileData(d)
                    }else{
                        FileData(nil)
                    }
                }
            })
        }else{
            do {
                let data = try Data.init(contentsOf: source_url)
                FileData(data)
            } catch {
                print("download error: \(source_url) error: \(error)")
                FileData(nil)
            }
        }
    }
    
    private func saveFile(path: String, mimeType: GalleryPhotos.mimeType, resultCollections: PHFetchResult<PHAssetCollection>){
        if resultCollections.count > 0{
            PHPhotoLibrary.shared().performChanges({
                var assetChangeRequest: PHAssetChangeRequest!
                if mimeType == .image{
                    assetChangeRequest  = PHAssetChangeRequest.creationRequestForAssetFromImage(atFileURL: URL(fileURLWithPath: path))
                }else{
                    assetChangeRequest  = PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: URL(fileURLWithPath: path))
                }
                
                let assetPlaceHolder = assetChangeRequest?.placeholderForCreatedAsset
                let albumChangeRequest = PHAssetCollectionChangeRequest(for: resultCollections.firstObject!)
                let enumeration: NSArray = [assetPlaceHolder!]
                albumChangeRequest!.addAssets(enumeration)
            }) {
                success, error in
                if success {
                    print("image Succesfully Saved")
                } else {
                    print(error?.localizedDescription as Any)
                }
            }
        }
    }
    
    
    public func downloadFiles(downloadURL: URL, url: URL, mimeType: GalleryPhotos.mimeType, resultCollections: PHFetchResult<PHAssetCollection>){
        print("download url: \(downloadURL)")
        if mimeType == .image{
            SDWebImageManager.shared.loadImage(with: downloadURL, options: .continueInBackground, progress: nil, completed: {(image, data, error, cacheType, finished, imageURL) in
                print("\(url.lastPathComponent) finished: \(finished)")
                if finished, let image = image{
                do {
                        let d = image.sd_imageData()
                        try d!.write(to: url, options: .atomic)
                        self.saveFile(path: url.path, mimeType: mimeType, resultCollections: resultCollections)
                    } catch {
                        print("download error: \(downloadURL) error: \(error)")
                    }
                }
            })
        }else{
            do {
                let data = try Data.init(contentsOf: downloadURL)
                try data.write(to: url)
                saveFile(path: url.path, mimeType: mimeType, resultCollections: resultCollections)
            } catch {
                print("download error: \(downloadURL) error: \(error)")
            }
        }

    }
    
    public func downloadFiles(key: String, filePath: String, mimeType: GalleryPhotos.mimeType, resultCollections: PHFetchResult<PHAssetCollection>, delete: Bool = true, completed:  @escaping(Bool) ->()){
        let bucket = "picaggo-app"
        let transferManager = AWSS3TransferUtility.default()
        let expression = AWSS3TransferUtilityDownloadExpression()
        let url = URL.init(fileURLWithPath: filePath)
        transferManager.downloadData(fromBucket: bucket, key: key, expression: expression, completionHandler: {(task, location, data, error) in
            guard let data = data, error == nil else{
                print("downloading error: \(error)")
                return
            }
            print("\(key) saved")
            do{
                try data.write(to: url, options: .atomic)
                if resultCollections.count > 0 && delete{
                    PHPhotoLibrary.shared().performChanges({
                        var assetChangeRequest: PHAssetChangeRequest!
                        if mimeType == .image{
                            assetChangeRequest  = PHAssetChangeRequest.creationRequestForAssetFromImage(atFileURL: URL(fileURLWithPath: filePath))
                        }else{
                            assetChangeRequest  = PHAssetChangeRequest.creationRequestForAssetFromVideo(atFileURL: URL(fileURLWithPath: filePath))
                        }
                        
                        let assetPlaceHolder = assetChangeRequest?.placeholderForCreatedAsset
                        let albumChangeRequest = PHAssetCollectionChangeRequest(for: resultCollections.firstObject!)
                        let enumeration: NSArray = [assetPlaceHolder!]
                        albumChangeRequest!.addAssets(enumeration)
                    }) {
                        success, error in
                        if success {
                            if delete{
                                do {
                                    try FileManager.default.removeItem(atPath: filePath)
                                } catch {
                                    print("Could not delete file, probably read-only filesystem: \(error)")
                                }
                            }
                            print("file Succesfully Saved")
                            completed(true)
                        } else {
                            print(error?.localizedDescription as Any)
                            completed(false)
                        }
                    }
                }else{
                    completed(true)
                }
            }
            catch{
                print("video data write error")
                completed(false)
            }
        })
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
