/* 
 * LeadTaskRollupJobTest
 * Created On: 08/15/2018
 * Created By: OpFocus (Brenda Finn)
 * Description: Unit tests for Lead Task Rollup Job functionality
 * @see LeadTaskRollupJob.cls
 */
@IsTest
private class LeadTaskRollupJobTest {
    @testSetup static void buildData() {
        User usr = [SELECT Id FROM User WHERE UserRoleId != '' AND Profile.PermissionsEmailMass = TRUE LIMIT 1];

        Lead lead = TestData.buildLead('Testers R Us, Inc.');
        lead.OwnerId = usr.Id;
        lead.Email = 'testee@testersrus.com';
        lead.Status = 'Active';
        lead.Active_Date__c = null;
        insert lead;

        Task callTask = TestData.buildTask(lead.Id, 'Call');
        callTask.Type = 'Call';
        callTask.ActivityDate = Date.today().addDays(2);
        callTask.Status = 'Completed';
        callTask.Subject = 'Other';
        insert callTask;

        // create an email message for our Lead
        List<Messaging.SingleEmailMessage> emailMessages = new List<Messaging.SingleEmailMessage>();
        
        Messaging.SingleEmailMessage emailMsg = new Messaging.SingleEmailMessage();
        emailMsg.setSubject('Test');
        emailMsg.setTargetObjectId(lead.Id);
        emailMsg.setSaveAsActivity(true);
        emailMsg.setPlainTextBody('Test email body');
		emailMessages.add(emailMsg);
            
        emailMsg = new Messaging.SingleEmailMessage();
        emailMsg.setSubject('Test1');
        emailMsg.setTargetObjectId(lead.Id);
        emailMsg.setSaveAsActivity(true);
        emailMsg.setPlainTextBody('Test email body1');
        emailMessages.add(emailMsg);
        
        Messaging.sendEmail(emailMessages);
    }

    @IsTest static void testStartBatch() {
        Lead lead = [select Id, Lead_Emails__c, Lead_Calls__c from Lead limit 1];
        lead.Lead_Calls__c = 0;
        lead.Lead_Emails__c = 0;
        lead.Activity_Rollups_Calculated__c = false;
        update lead;
        
        Test.startTest();
        	LeadTaskRollupJob batchJob = new LeadTaskRollupJob();
  			Database.QueryLocator queryLocator = batchJob.start(null);
        	batchJob.execute(null, Database.query(queryLocator.getQuery()));
	        batchJob.finish(null);
        Test.stopTest();
        lead = [select Lead_Emails__c, Id, Activity_Rollups_Calculated__c from Lead where Id=:lead.Id limit 1];
        System.assertEquals(2, lead.Lead_Emails__c,
                           'Failed to set Lead Emails in batch job.');
        System.assertEquals(true, lead.Activity_Rollups_Calculated__c, 'Failed to set Activity_Rollups_Calculated__c');
    }

}