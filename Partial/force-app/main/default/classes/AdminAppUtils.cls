/* Class:       AdminAppUtils
** Created by:  OpFocus (Veena Sundara-Heragu) on 08/09/2016
** Description: 
*/
public class AdminAppUtils 
{

    /**
     * creates backlog records for mirror api processing.
     * ONLY CALL FROM TRIGGER OR TRIGGERHANDLER
     * @param  records [records to make backlogs for]
     * @return         [list of backlog records]
     */
    public static Mirror_API_Backlog__c[] createBacklogs(List<SObject> records)
    {
        List<Mirror_API_Backlog__c> backlogs = new List<Mirror_API_Backlog__c>();
        if(!MirrorTriggerSettings__c.getInstance(UserInfo.getUserId()).Backlog_Switch__c){
        	return backlogs;
        }
        for(SObject record : records)
        {
            Mirror_API_Backlog__c mab = new Mirror_API_Backlog__c();
            // get sobject name dynamically based on id
            mab.Object_Name__c = ((Id)record.get('Id')).getSobjectType().getDescribe().getName();
            mab.Record_Id__c = (Id)record.get('Id');
            // get action name from trigger context
            mab.Action__c = Trigger.isInsert ? 'Insert' : (Trigger.isUpdate ? 'Update' : (Trigger.isDelete ? 'Delete' : null));
            backlogs.add(mab);
        }
        insert backlogs;
        return backlogs;
    }

	// Description	: makes callout to adminapp
	// @param 		: endPoint - adminapp endpoint
	// @return		: 
	@future (callout=true)
	public static void makeCallout(String endPoint, String fromApp) {
		makeCallout(endPoint, null, fromApp);
	}

	public static String makeCallout(String endPoint, Id recordId, String fromApp)
	{
		try
		{
	        if(Limits.getCallouts() == Limits.getLimitCallouts())
	        {
	        	throw new CalloutException('Cannot make more than ' + Limits.getLimitCallouts() + ' Callouts in one transaction');
	        }

	        HttpRequest request = new HttpRequest();
	        request.setEndpoint(endPoint);
			request.setTimeout(20000);
	        request.setMethod('GET');
	        request.setHeader('Content-Length', '0'); // no body

	        Http h = new Http();
	        HttpResponse response = h.send(request);
	        Integer status = response.getStatusCode();

	        if(status != 200)
	        {
	        	throw new CalloutException('HTTP Callout failed\r\n\r\nStatus Code: ' + status + '\r\n\r\nStatus: ' + response.getStatus() + 
	        								'\r\n\r\nResponse: ' + response.getBody());
	        }
			system.debug('result = ' + JSON.serializePretty(response.getBody()));
			return response.getBody();
		}
		catch(Exception ex)
		{
			Utils.sendAsyncAdminEmail('Exception occurred in ' + fromApp, 
										'Exception: ' + ex.getMessage() + ex.getStackTraceString() +
										'\r\n\r\nendPoint: ' + endPoint);
			return null;
		}
	}

	private static String adminAppBaseUrl;
	public static String getAdminAppBaseUrl()
	{
		if(adminAppBaseUrl == null)
		{
			List<AdminApp__mdt> lstCMT = [Select Callout_Base_Url__c from AdminApp__mdt limit 1];
			adminAppBaseUrl = lstCMT.isEmpty() ? 'https://adminapp' : lstCMT[0].Callout_Base_Url__c;
		}
		return adminAppBaseUrl;
	}

	public Class CalloutException extends Exception{}

}