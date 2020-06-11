/**
 * Created by brendafinn on 2019-03-31.
 */

@IsTest
private  class CmpCalloutActionCtrlTest {

    @TestSetup
    static void buildData() {
        Account testAcct = new Account(Name='test Account');
        insert testAcct;
    }


    @IsTest
    static void testSuccess() {
        CmpCalloutActionCtrl.testCalloutConfig = new Callout_Configuration__mdt( DeveloperName='Test', Endpoint__c='https://google.com',
                Object_Name__c='Account', Is_Active__c=true);
        CmpCalloutActionCtrl.testCalloutParamMaps = new List<Callout_Parameter_Map__mdt>();
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='Name',
                Parameter_Name__c='Name', Is_Active__c=true));
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='AccountSource',
                Parameter_Name__c='Source', Is_Active__c=true));
        CmpCalloutActionCtrl.CalloutResults results;

        Test.startTest();
            Account acct = [select Id from Account limit 1];
            CmpCalloutActionCtrl.CalloutRequest request = new CmpCalloutActionCtrl.CalloutRequest();
            request.sObjectName='Account';
            request.calloutName='Test Callout';
            request.recordId=acct.Id;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
            System.assertEquals(true, results.success, 'Failed to return success when expected : results = ' + JSON.serializePretty(results));

            delete acct;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
            System.assertEquals(false, results.success, 'Failed to return failure when could not find record : results = ' + JSON.serializePretty(results));
        Test.stopTest();
    }

    @IsTest
    static void testInvalidPermission_Delete() {

        User usr = [SELECT Id FROM User WHERE Profile.Name = 'Marketing' AND IsActive = TRUE LIMIT 1];

        CmpCalloutActionCtrl.testCalloutConfig = new Callout_Configuration__mdt( DeveloperName='Test', Endpoint__c='https://google.com',
                Object_Name__c='CalloutTestObject', Is_Active__c=true, ObjectPermission__c = 'Delete');
        CmpCalloutActionCtrl.testCalloutParamMaps = new List<Callout_Parameter_Map__mdt>();
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='Name',
                Parameter_Name__c='Name', Is_Active__c=true));
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='AccountSource',
                Parameter_Name__c='Source', Is_Active__c=true));
        CmpCalloutActionCtrl.CalloutResults results;

        Test.startTest();
        System.runAs(usr) {
            Account acct = [select Id from Account limit 1];
            CmpCalloutActionCtrl.CalloutRequest request = new CmpCalloutActionCtrl.CalloutRequest();
            request.sObjectName = 'CalloutTestObject';
            request.calloutName = 'Test Callout';
            request.recordId = acct.Id;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
            System.assertEquals(false, results.success, 'Failed to return failure when expected : results = ' + JSON.serializePretty(results));
        }
        Test.stopTest();
    }

    @IsTest
    static void testInvalidPermission_Read() {

        User usr = [SELECT Id FROM User WHERE Profile.Name = 'Marketing' AND IsActive = TRUE LIMIT 1];

        CmpCalloutActionCtrl.testCalloutConfig = new Callout_Configuration__mdt( DeveloperName='Test', Endpoint__c='https://google.com',
                Object_Name__c='CalloutTestObject', Is_Active__c=true, ObjectPermission__c = 'Read');
        CmpCalloutActionCtrl.testCalloutParamMaps = new List<Callout_Parameter_Map__mdt>();
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='Name',
                Parameter_Name__c='Name', Is_Active__c=true));
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='AccountSource',
                Parameter_Name__c='Source', Is_Active__c=true));
        CmpCalloutActionCtrl.CalloutResults results;

        Test.startTest();
        System.runAs(usr) {
            Account acct = [select Id from Account limit 1];
            CmpCalloutActionCtrl.CalloutRequest request = new CmpCalloutActionCtrl.CalloutRequest();
            request.sObjectName = 'CalloutTestObject';
            request.calloutName = 'Test Callout';
            request.recordId = acct.Id;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
            System.assertEquals(false, results.success, 'Failed to return failure when expected : results = ' + JSON.serializePretty(results));
        }
        Test.stopTest();
    }

    @IsTest
    static void testInvalidPermission_Create() {

        // Remove Create from Marketing Users
        User usr = [SELECT Id FROM User WHERE Profile.Name = 'Marketing' AND IsActive = TRUE LIMIT 1];

        CmpCalloutActionCtrl.testCalloutConfig = new Callout_Configuration__mdt( DeveloperName='Test', Endpoint__c='https://google.com',
                Object_Name__c='CalloutTestObject', Is_Active__c=true, ObjectPermission__c = 'Create');
        CmpCalloutActionCtrl.testCalloutParamMaps = new List<Callout_Parameter_Map__mdt>();
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='Name',
                Parameter_Name__c='Name', Is_Active__c=true));
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='AccountSource',
                Parameter_Name__c='Source', Is_Active__c=true));
        CmpCalloutActionCtrl.CalloutResults results;

        Test.startTest();
        System.runAs(usr) {
            Account acct = [select Id from Account limit 1];
            CmpCalloutActionCtrl.CalloutRequest request = new CmpCalloutActionCtrl.CalloutRequest();
            request.sObjectName = 'CalloutTestObject';
            request.calloutName = 'Test Callout';
            request.recordId = acct.Id;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
            System.assertEquals(false, results.success, 'Failed to return failure when expected : results = ' + JSON.serializePretty(results));
        }
        Test.stopTest();
    }

    @IsTest
    static void testInvalidPermission_Edit() {

        User usr = [SELECT Id FROM User WHERE Profile.Name = 'Marketing' AND IsActive = TRUE LIMIT 1];

        CmpCalloutActionCtrl.testCalloutConfig = new Callout_Configuration__mdt( DeveloperName='Test', Endpoint__c='https://google.com',
                Object_Name__c='CalloutTestObject', Is_Active__c=true, ObjectPermission__c = 'Edit');
        CmpCalloutActionCtrl.testCalloutParamMaps = new List<Callout_Parameter_Map__mdt>();
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='Name',
                Parameter_Name__c='Name', Is_Active__c=true));
        CmpCalloutActionCtrl.testCalloutParamMaps.add(new Callout_Parameter_Map__mdt(Source_Field_Name__c='AccountSource',
                Parameter_Name__c='Source', Is_Active__c=true));
        CmpCalloutActionCtrl.CalloutResults results;

        Test.startTest();
        System.runAs(usr) {
            Account acct = [select Id from Account limit 1];
            CmpCalloutActionCtrl.CalloutRequest request = new CmpCalloutActionCtrl.CalloutRequest();
            request.sObjectName = 'CalloutTestObject';
            request.calloutName = 'Test Callout';
            request.recordId = acct.Id;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
            System.assertEquals(false, results.success, 'Failed to return failure when expected : results = ' + JSON.serializePretty(results));
        }
        Test.stopTest();
    }

    @IsTest
    static void testMissingConfig() {
        CmpCalloutActionCtrl.CalloutResults results;

        Test.startTest();
            Account acct = [select Id from Account limit 1];
            CmpCalloutActionCtrl.CalloutRequest request = new CmpCalloutActionCtrl.CalloutRequest();
            request.sObjectName='Account';
            request.calloutName='Test Callout';
            request.recordId=acct.Id;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
        Test.stopTest();
        System.assertEquals(results.success, false, 'Failed to return error when config missing.');
    }

    @IsTest
    static void testMissingParams() {
        CmpCalloutActionCtrl.testCalloutConfig = new Callout_Configuration__mdt( DeveloperName='Test', Endpoint__c='https://google.com',
                Object_Name__c='Account', Is_Active__c=true);
        CmpCalloutActionCtrl.CalloutResults results;

        Test.startTest();
            Account acct = [select Id from Account limit 1];
            CmpCalloutActionCtrl.CalloutRequest request = new CmpCalloutActionCtrl.CalloutRequest();
            request.sObjectName='Account';
            request.calloutName='Test Callout';
            request.recordId=acct.Id;
            results = CmpCalloutActionCtrl.sendMessage(JSON.serialize(request));
        Test.stopTest();
        System.assertEquals(false, results.success, 'Failed to return error when missing parameter map : results = ' + JSON.serializePretty(results));
    }
}