/* 
 * TaskTriggerHandlerTest
 * Created On: 07/29/2018
 * Created By: OpFocus (Brenda Finn)
 * Description: Unit tests for Task Trigger functionality
 * @see TaskTriggerHandler.cls
 */
@IsTest
private class TaskTriggerHandlerTest {
    @testSetup static void buildData() {

        User usr = [SELECT Id FROM User WHERE UserRoleId != '' AND Profile.PermissionsEmailMass = TRUE LIMIT 1];

        Lead lead = TestData.buildLead('Testers R Us, Inc.');
        lead.OwnerId = usr.Id;
        lead.Email = 'testee@testersrus.com';
        lead.Status = 'Active';
        lead.Active_Date__c = null;
        insert lead;

        Task callTask = TestData.buildTask(lead.Id, 'Subject');
        callTask.Type = 'Subject';
        callTask.ActivityDate = Date.today().addDays(2);
        insert callTask;

        Account acct = TestData.buildAccount('Testers R Us, Inc.');
        insert acct;
        Contact contact = TestData.buildContact(acct.Id, 'Testee', 'Tester');
        contact.MailingStreet = '500 Main Street';
        contact.MailingCity = 'Warrenton';
        contact.MailingState = 'Virginia';
        contact.MailingStateCode = 'VA';
        insert contact;
    }

    @IsTest static void testUpdateOnNonLead() {
        Contact contact = [select Id from Contact];
        Task contactTask = TestData.buildTask(contact.Id, 'Call');

        Test.startTest();
            // build task for non-Lead
            contactTask.Status = 'Completed';
            insert contactTask;
        Test.stopTest();
        System.assertEquals(false, TaskTriggerHandler.processedUpdateIds.contains(contactTask.Id),
                'Incorrectly processed a non-Lead task.');
    }

    @IsTest static void testRollupTasksOnUpdate() {
        Task task = [select Id from Task limit 1];
        Test.startTest();
            task.Subject = 'Message Sent';
            // OpFocus (bfinn) 9/10/2018 : added status of Completed to ensure rules fire as expected
            task.Status = 'Completed';
            update task;
            update task; // test re-entry
        Test.stopTest();
        System.assertEquals(1, [select Id, Lead_Calls__c  from Lead limit 1].Lead_Calls__c ,
                            'Failed to update Lead_Calls__c  Count on update.');
    }

    @IsTest static void testRollupTasksOnInsert() {
        Lead lead = [select Id,Email from Lead limit 1];

        // create an email message for our Lead
        Messaging.SingleEmailMessage emailMsg = new Messaging.SingleEmailMessage();
        emailMsg.setSubject('Test');
        emailMsg.setTargetObjectId(lead.Id);
        emailMsg.setSaveAsActivity(true);
        emailMsg.setPlainTextBody('Test email body');

        Test.startTest();
            Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{emailMsg});
            System.assertEquals(1, [select Id, Lead_Emails__c from Lead limit 1].Lead_Emails__c,
                'Failed to update Lead_Emails__c Count on insert.');
        
            Map<Id, Task> tasks = new Map<Id,Task>([select Id from Task]);
            // now delete tasks and then undelete it
            delete tasks.values();
            System.assertEquals(0, [select Id, Lead_Emails__c from Lead limit 1].Lead_Emails__c,
                'Failed to update Lead_Emails__c Count on delete.');

            undelete tasks.values();
            System.assertEquals(1, [select Id, Lead_Emails__c from Lead limit 1].Lead_Emails__c,
                'Failed to update Lead_Emails__c Count on undelete.');

            // make sure we do not decrement touch count to be negative
            lead.Lead_Emails__c = 0;
            update lead;
            TaskTriggerHandler.processedDeleteIds.removeAll(tasks.keyset());
            delete tasks.values();
        Test.stopTest();
        System.assertEquals(0, [select Id, Lead_Emails__c from Lead limit 1].Lead_Emails__c,
                'Updated Lead_Emails__c Count to be negative.');
    }
}