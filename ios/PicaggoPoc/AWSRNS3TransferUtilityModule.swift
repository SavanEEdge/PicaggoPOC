//
//  AWSRNS3TransferUtilityModule.swift
//  PicaggoPoc
//
//  Created by user218041 on 7/8/23.
//

import Foundation
import AWSS3

@objc(AWSRNS3TransferUtility)
class AWSRNS3TransferUtilityModule: NSObject{
  
  private var transferUtility:
  
  @objc
    static func requiresMainQueueSetup() -> Bool {
      return true
    }
  
  @objc
    func constantsToExport() -> [AnyHashable: Any] {
      return [
        "UPLOAD": "upload",
                "BUCKET": "bucket",
                "KEY": "key",
                "FILE_PATH": "path",
                "REQUESTID": "requestid",
                "REGION": "region",
                "POLL_ID": "poll_id",
                "GOOGLE_JWT_TOKEN": "google_jwt_token",
                "SUBSCRIBE": "subscribe",
                "COMPLETIONHANDLER": "completionhandler",
                "TYPE": "type"
      ]
    }
  
  @objc
  func initWithOptions(_ options: NSDictionary, resolver resolve: RCTPromiseResolveBlock, rejecter reject:RCTPromiseRejectBlock) {
   guard let region = options[constantsToExport()["REGION"]] as? String else {
     reject("PARAMETER_ERROR", "region not supplied", nil)
     return
   }
   
   guard let pollID = options[constantsToExport()["POLL_ID"]] as? String else {
     reject("PARAMETER_ERROR", "poll_id not supplied", nil)
     return
   }
   
   guard let googleJWTToken = options[constantsToExport()["GOOGLE_JWT_TOKEN"]] as? String else {
     reject("PARAMETER_ERROR", "google jwt token not supplied", nil)
     return
   }
    
    
  }
  
}
