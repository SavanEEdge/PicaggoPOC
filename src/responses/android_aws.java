package application.share.photo.picaggo.helper.upload;

import android.content.Context;
import android.util.Log;

import com.amazonaws.AmazonServiceException;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.s3.transferutility.TransferUtility;
import com.amazonaws.regions.Region;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3Client;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.TaskCompletionSource;

import java.util.HashMap;

import application.share.photo.picaggo.helper.utils.Constant;
import application.share.photo.picaggo.helper.utils.DataSource;
import application.share.photo.picaggo.helper.utils.MySharedPreferences;

public class AWS_Support {
    public static AWS_Support instance;
    private final Context context;
    private final String Tag = Constant.Log.TAG + getClass().getName();

    private AWS_Support(Context context){
        this.context = context;
    }

    public static synchronized AWS_Support getInstance(Context context) {
        if (instance == null){
            instance = new AWS_Support(context);
        }
        return instance;
    }

    public Task<TransferUtility> getTransferUtility(){
        TaskCompletionSource<TransferUtility> taskCompletionSource = new TaskCompletionSource<>();
        CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
                context,
                MySharedPreferences.getAWSPoolId(context), // Identity pool ID
                Regions.fromName(MySharedPreferences.getAWSRegion(context)) // Region
        );
        DataSource.instance.getJWTToken(context, false).addOnSuccessListener(token -> {
            HashMap<String, String> logins = new HashMap<>();
            logins.put("securetoken.google.com/picaggo-235807", token);
            credentialsProvider.setLogins(logins);
            MySharedPreferences.setAWSConfigSet(context, true);
            AmazonS3Client client = new AmazonS3Client(credentialsProvider, Region.getRegion(Regions.fromName(MySharedPreferences.getAWSRegion(context))));
            TransferUtility transferUtility = TransferUtility.builder().s3Client(client).context(context).build();
            taskCompletionSource.setResult(transferUtility);
        }).addOnFailureListener(taskCompletionSource::setException);
        return  taskCompletionSource.getTask();
    }

    public Task<AmazonS3Client> getClient(){
        TaskCompletionSource<AmazonS3Client> taskCompletionSource = new TaskCompletionSource<>();
        CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
                context,
                MySharedPreferences.getAWSPoolId(context), // Identity pool ID
                Regions.fromName(MySharedPreferences.getAWSRegion(context)) // Region
        );
        DataSource.instance.getJWTToken(context, false).addOnSuccessListener(token -> {
            HashMap<String, String> logins = new HashMap<>();
            logins.put("securetoken.google.com/picaggo-235807", token);
            credentialsProvider.setLogins(logins);
            MySharedPreferences.setAWSConfigSet(context, true);
            AmazonS3Client client = new AmazonS3Client(credentialsProvider, Region.getRegion(Regions.fromName(MySharedPreferences.getAWSRegion(context))));
            taskCompletionSource.setResult(client);
        }).addOnFailureListener(taskCompletionSource::setException);
        return  taskCompletionSource.getTask();
    }

    public Task<Boolean> doesFileExists(String key){
        TaskCompletionSource<Boolean> taskCompletionSource = new TaskCompletionSource<>();
        CognitoCachingCredentialsProvider credentialsProvider = new CognitoCachingCredentialsProvider(
                context,
                MySharedPreferences.getAWSPoolId(context), // Identity pool ID
                Regions.fromName(MySharedPreferences.getAWSRegion(context)) // Region
        );
        DataSource.instance.getJWTToken(context, false).addOnSuccessListener(token -> {
            HashMap<String, String> logins = new HashMap<>();
            logins.put("securetoken.google.com/picaggo-235807", token);
            credentialsProvider.setLogins(logins);
            MySharedPreferences.setAWSConfigSet(context, true);
            new Thread(() -> {
                AmazonS3Client client = new AmazonS3Client(credentialsProvider, Region.getRegion(Regions.fromName(MySharedPreferences.getAWSRegion(context))));
                try {
                    Boolean exists = client.doesObjectExist(MySharedPreferences.getAWSBucket(context),key);
                    taskCompletionSource.setResult(exists);
                } catch (AmazonServiceException e){
                    if ((e.getErrorType() == AmazonServiceException.ErrorType.Client)){
                        taskCompletionSource.setResult(false);
                    }else{
                        taskCompletionSource.setException(e);
                    }
                    Log.d(Tag, "file exists error: "+e);
                    Log.d(Tag,"error type: " + e.getErrorType() + " = " + AmazonServiceException.ErrorType.Client + " : " +  (e.getErrorType() == AmazonServiceException.ErrorType.Client));
                    Log.d(Tag,"error type: " + e.getErrorType() + " = " + AmazonServiceException.ErrorType.Service + " : " +  (e.getErrorType() == AmazonServiceException.ErrorType.Service));
                }catch (Exception e){
                    taskCompletionSource.setException(e);
                    Log.e(Tag, "does obj exists other exception: ", e);
                }
            }).start();
        }).addOnFailureListener(taskCompletionSource::setException);
        return taskCompletionSource.getTask();
    }
}
