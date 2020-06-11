/**
 * Created by Rick on 3/14/2018.
 */

public with sharing class CmpChangeOppAccountCtrl {


    public String errorM {get; set;}
    // Description	: gets account Type
    // @param 		: accountId - Id of Account
    @AuraEnabled
    public static Account ctrlFetchAccountFromOpp ( String oppId)
    {
        try
        {

            system.debug('=========> oppId = ' + oppId);
            Account retVal;

            Opportunity opp = [select Accountid From Opportunity Where Id = :oppId limit 1];

            //string accountId = lstOpportunities[0].Accountid;
            string accountId = opp.AccountId;

            retval = ctrlFetchAccountFromAccountId(accountId);


            return retVal;


        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occured:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

    @AuraEnabled
    public static Account ctrlFetchAccountFromAccountId(String accountId)
    {
        try
        {
            system.debug('=========>accountId='+accountId);
            Account retVal;

            retVal= (Account) Database.query('Select ' + SchemaHelper.getSObjectFields('Account') +
                    ' From Account Where Id = :accountId');

            return retVal;
        }
        catch(Exception ex)
        {
            throw new AuraHandledException('Exception occured: \r\n' + ex.getMessage()+'\r\n' + ex.getStackTraceString()+'\r\n');
        }
    }


    @AuraEnabled
    public static calloutResult ctrlSave( String oppId, String accountId)
    {
        try
        {

            String endPoint = AdminApputils.getAdminAppBaseUrl() + '.careercruising.com/api/Integrations/OpportunityAccountChange?oppId=' + oppId + '&accountId=' + accountId;

            System.debug('======> Endpoint = ' + endPoint);

            String responseBody = AdminApputils.makeCallout(endPoint, null, 'CmpChangeOppAccountCtrl.ctrlSave');

            // response body is formatted as follows : {"result" : {"success":"true","message":"XXX", "detail":""}, "Id":"000000000000000"}
            System.debug('======> responseBody = ' + responseBody);

            // custom exception instead of AuraHandled exception. Can't throw the exception class itself
            if (responseBody == null) throw new calloutException('Recieved null result from callout. Contact system admin.');

            Map<String,Object> mapParams = (Map<String,Object>)JSON.deserializeUntyped(responseBody);

            Map<String, Object> resultObj = (Map<String, Object>)mapParams.get(RESULT_PARAM);
            Boolean blnSuccess = (Boolean)resultObj.get(SUCCESS_PARAM);

            String errorMsg = (String)resultObj.get(MESSAGE_PARAM) + ' ' +
                    (resultObj.get(DETAIL_PARAM) != null ? resultObj.get(DETAIL_PARAM) : '');

            if (blnSuccess) {
                Opportunity o = new Opportunity(id = oppId, accountId = accountid );
                update o;

                return new calloutResult(true, errorMsg); // stay on page so we can display error message
            }
            else {
                return new calloutResult(false, errorMsg); // stay on page so we can display error message
            }

        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occured:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

public class calloutException extends Exception {


}

    private static final String RESULT_PARAM = 'result';
    private static final String SUCCESS_PARAM = 'success';
    private static final String DETAIL_PARAM = 'detail';
    private static final String MESSAGE_PARAM = 'message';
    private static final String FAILURE_MESSAGE = 'Other opportunities reference this opportunity as a renewal. ';

public class calloutResult {
    @AuraEnabled public boolean result;
    @AuraEnabled public string message;

    public calloutResult (boolean res, string msg) {
        result = res;
        message = msg;
    }

}

}