package application.share.photo.picaggo;

import android.util.Log;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferListener;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferState;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3Client;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class AWSRNS3TransferUtilityModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    private String identityPoolId;

    private String region;
    private String googleJWTToken;

    private TransferUtility transferUtility;
    private static final ConcurrentHashMap<String, ConcurrentHashMap<String, Object>> requestMap = new ConcurrentHashMap<>();

    private static final String TAG = "AWSRNS3TransferUtility";
    private static final String REGION = "region";
    private static final String POLL_ID = "poll_id";
    private static final String GOOGLE_JWT_TOKEN = "google_jwt_token";
    private static final String BUCKET = "bucket";
    private static final String FILE_PATH = "path";
    private static final String KEY = "key";
    private static final String SUBSCRIBE = "subscribe";
    private static final String COMPLETIONHANDLER = "completionhandler";
    private static final String TYPE = "type";
    private static final String UPLOAD = "upload";
    private static final String REQUESTID = "requestid";

    @NonNull
    @Override
    public String getName() {
        return "AWSRNS3TransferUtility";
    }

    public AWSRNS3TransferUtilityModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @ReactMethod
    public void initWithOptions(final ReadableMap options, Promise promise){
        try {
        if (!options.hasKey(REGION)|| options.getString(REGION) == null) {
            throw new IllegalArgumentException("region not supplied");
        }
        if (!options.hasKey(POLL_ID)|| options.getString(POLL_ID) == null) {
            throw new IllegalArgumentException("poll_id not supplied");
        }
        if (!options.hasKey(GOOGLE_JWT_TOKEN)|| options.getString(GOOGLE_JWT_TOKEN) == null) {
            throw new IllegalArgumentException("google jwt token not supplied");
        }


            this.identityPoolId = options.getString(POLL_ID);
            this.region = options.getString(REGION);
            this.googleJWTToken = options.getString(GOOGLE_JWT_TOKEN);
            CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(this.reactContext, this.identityPoolId, Regions.fromName(this.region));
            HashMap<String, String> logins = new HashMap<>();
            logins.put("securetoken.google.com/picaggo-235807", this.googleJWTToken);
            credentialsProvider.setLogins(logins);
            AmazonS3Client client = new AmazonS3Client(credentialsProvider, Region.getRegion(Regions.fromName(this.region)));
            this.transferUtility = TransferUtility.builder().s3Client(client).context(reactContext).build();
            promise.resolve(true);
        } catch (Exception e){
            promise.reject(e);
        }
    }

    @ReactMethod
    public void createUploadRequest(final ReadableMap options, Promise promise){
        final String[] params = {BUCKET, KEY, FILE_PATH, SUBSCRIBE, COMPLETIONHANDLER};
        for (int i = 0; i < params.length; i++) {
            if (!options.hasKey(params[i])) {
                promise.reject("PARAMETER_ERROR", params[i] + " is not supplied", (Throwable) null);
                return;
            }
        }
        final ConcurrentHashMap<String, Object> map = new ConcurrentHashMap<>();
        map.put(BUCKET, Objects.requireNonNull(options.getString(BUCKET)));
        map.put(KEY, Objects.requireNonNull(options.getString(KEY)));
        map.put(FILE_PATH, Objects.requireNonNull(options.getString(FILE_PATH)));
        map.put(SUBSCRIBE, options.getBoolean(SUBSCRIBE));
        map.put(COMPLETIONHANDLER, options.getBoolean(COMPLETIONHANDLER));
        map.put(TYPE, UPLOAD);
        final UUID uuid = UUID.randomUUID();
        requestMap.put(uuid.toString(), map);
        promise.resolve(uuid.toString());
    }

    @ReactMethod
    public void upload(final ReadableMap options, Promise promise) {
        if (!options.hasKey(REQUESTID)) {
            throw new IllegalArgumentException("requestid is not supplied");
        }
        final String requestID = options.getString(REQUESTID);
        final Map<String, Object> map = requestMap.get(requestID);
        if (map == null) {
            throw new IllegalArgumentException("requestid is invalid");
        }


        String bucket = (String) map.get(BUCKET);
        String filePath = (String) map.get(FILE_PATH);
        String key = (String) map.get(KEY);

        String mail_file_path = filePath.replace("file://", "");
        File mainFile = new File(mail_file_path);
        if(mainFile.exists()){
            Log.d(TAG, mainFile.getPath());
            this.transferUtility.upload(bucket, key, mainFile).setTransferListener(new TransferListener() {
                @Override
                public void onStateChanged(int id, TransferState state) {
                    Log.d(TAG,"Id "+id+" State: "+state);
                    if(state == TransferState.COMPLETED){
                        promise.resolve("Upload Successful for request id: "+requestID+" !!!");
                    }
                }

                @Override
                public void onProgressChanged(int id, long bytesCurrent, long bytesTotal) {
                    Log.d(TAG,"Id "+id+" bytesCurrent: "+bytesCurrent + " bytesTotal "+bytesTotal);
//                    WritableMap params = Arguments.createMap();
//                    params.putInt("taskId", id);
//                    params.putDouble("bytesCurrent", bytesCurrent);
//                    params.putDouble("bytesTotal", bytesTotal);
//
//                    getReactApplicationContext()
//                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
//                            .emit("uploadProgress", params);
                }

                @Override
                public void onError(int id, Exception ex) {
                    Log.d(TAG,"Id "+id+" Exception: "+ex.toString());
//                    final WritableMap map = Arguments.createMap();
//                    final WritableMap errorMap = Arguments.createMap();
//                    errorMap.putString("ERROR", ex.toString());
//                    errorMap.putString("DESCRIPTION", ex.getLocalizedMessage());
//                    errorMap.putInt("CODE", ex.hashCode());
//                    map.putMap("ERROR", errorMap);
//                    sendEvent(getReactApplicationContext(), "UtilityErrorEvent", map);
                }
            });

        } else {
            Log.d(TAG, "File on path "+filePath+" not exists!!");
            promise.reject("FILE_NOT_FOUND", "File not found");
        }
    }

    private void sendEvent(ReactContext rnContext, String eventName, @Nullable WritableMap params){
        rnContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
}
