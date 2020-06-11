/* Class:       Utils
** Created by:  OpFocus (Veena Sundara-Heragu) on 07/26/2017
** Description: Class for common utility methods
*/

public class Utils 
{
    /**
     * determines if trigger context if turned on in custom metadta type
     * @param  name [Name of metadata type record]
     * @return      [Boolean]
     */
    public static Boolean dontRunTrigger(String name){
        Trigger_Setting__mdt[] lstTriggerSetting = [SELECT
                                                            On__c,Insert_On__c,Update_On__c,Delete_On__c
                                                    FROM
                                                            Trigger_Setting__mdt
                                                    WHERE
                                                            DeveloperName=:name];
        if(lstTriggerSetting != null && !lstTriggerSetting.isEmpty())
        {
            Trigger_Setting__mdt triggerSetting = lstTriggerSetting[0];
            if (!triggerSetting.On__c) return true;
            if (Trigger.isInsert && !triggerSetting.Insert_On__c) return true;
            if (Trigger.isUpdate && !triggerSetting.Update_On__c) return true;
            if (Trigger.isDelete && !triggerSetting.Delete_On__c) return true;
        }
        return false;
    }

	// Description	: Sends email to all the admins listed in the custom metadata type "Async Admin Email" as plain text
	// @param 		: subject 
	// @param 		: body
	// @return		: 
	public static void sendAsyncAdminEmail(String subject, String body)
	{
		sendAsyncAdminEmail(subject, body, false);
	}
	// Description	: Sends email to all the admins listed in the custom metadata type "Async Admin Email" 
	// @param 		: subject 
	// @param 		: body
	// @param 		: isHtml (Boolean) - if true, sends the email as html, otherwise, as plain text
	// @return		: 
	public static void sendAsyncAdminEmail(String subject, String body, Boolean isHtml)
	{
        // get email addresses to send from custom metadata type
        Async_Admin_Email__mdt[] lstCM = [Select Admin_Email__c from Async_Admin_Email__mdt];

        List<String> lstAdminEmails = new List<String>();       
        for(Async_Admin_Email__mdt cm : lstCM)
        {
            lstAdminEmails.add(cm.Admin_Email__c);
        }

        // if no admins have been set up, send the email to the running user
        if(lstAdminEmails.isEmpty())
        {
            lstAdminEmails.add(UserInfo.getUserEmail());
        }

        Messaging.SingleEmailMessage semResult = new Messaging.SingleEmailMessage();
        semResult.setToAddresses(lstAdminEmails);
        
        semResult.setSubject(subject);
        if(isHtml)
        {
        	semResult.setHtmlBody(body);
        }
        else
        {
        	semResult.setPlainTextBody(body);
        }


        try
        {
          Messaging.sendEmail(new Messaging.SingleEmailMessage[] { semResult });
        }
        catch(Exception e)
        {
          system.debug(e);
        }        

	}

	public Class EmailException extends Exception{}
}