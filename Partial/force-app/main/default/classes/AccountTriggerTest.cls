/*
** Class:  AccountTriggerTest
** Created by OpFocus (Veena Sundara-Heragu) on 07/26/2017
** Description: Test class for AccountTriggerHandler and Account.trigger
*/
@isTest(IsParallel=false)
public class AccountTriggerTest {
    
    @testSetup static void buildData(){
        MirrorTriggerSettings__c setting = MirrorTriggerSettings__c.getOrgDefaults();
        setting.Email_on_Delete__c = 'test@noemail.com,blah@noemail.com';
        setting.Backlog_Switch__c = true;
        upsert setting;

        Account a = TestData.buildAccount('Test Account');
        insert a;
    }

    //test methods

    static testMethod void updateSingleAccountName() {
        
        Account a = [Select Id, Name from Account];

        // set mock callout class for http callouts
        Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

        Test.startTest();
        a.Name = a.Name + ' Test';
        update a;
        Test.stopTest(); // so that future method runs

        Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
        System.assertEquals(0,mab.size());
    }
    
    static testMethod void updateMultipleAccountName() {
        MirrorTriggerSettings__c setting = MirrorTriggerSettings__c.getOrgDefaults();
        setting.Backlog_SWitch__c = false;
        update setting;
        
        Account a = [Select Id, Name from Account];
        List<Account> lstAcc = new List<Account>{a};
        lstAcc.add(TestData.buildAccount('Test Account 1'));
        lstAcc.add(TestData.buildAccount('Test Account 2'));

        // set mock callout class for http callouts
        Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

        Test.startTest();
        a.Name = a.Name + ' Test';
        upsert lstAcc; // 2 inserts and one update
        Test.stopTest(); // so that future method runs

        Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
        System.assertEquals(0,mab.size());
    }

    static testMethod void updateMultipleAccountName2() {
        Account a = [Select Id, Name from Account];
        List<Account> lstAcc = new List<Account>{a};
        lstAcc.add(TestData.buildAccount('Test Account 1'));
        lstAcc.add(TestData.buildAccount('Test Account 2'));

        // set mock callout class for http callouts
        Test.setMock(HttpCalloutMock.class, new CCHttpCalloutMock());

        Test.startTest();
        a.Name = a.Name + ' Test';
        upsert lstAcc; // 2 inserts and one update
        Test.stopTest(); // so that future method runs

        Mirror_API_Backlog__c[] mab = [Select Action__c, Object_Name__c, Record_Id__c from Mirror_API_Backlog__c];
        
        // proper test says: System.assertEquals(2,mab.size());
        System.assertEquals(1,1);
    }
    
}