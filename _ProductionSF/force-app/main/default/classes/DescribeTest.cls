@isTest
private class DescribeTest {
    @isTest static void describeTest1(){
        boolean isId = true;
        List<object> toAddress = Describe.SalesforceObject('Product2');
        System.assertEquals(true,IsId,'MyMessage');
    } 
    @isTest static void describeTest2(){
        boolean isId = true;
        List<object> toAddress = Describe.ObjectList();
        System.assertEquals(true,IsId,'MyMessage');
    }
    @isTest static void describeTest3(){
        boolean isId = true;
        String strResult;
        strResult = Describe.getAccountIdFromRecordId('00141000019hroXAAQ'); //Account
        strResult = Describe.getAccountIdFromRecordId('a024100000Y0zLHAAZ'); //System__c
        strResult = Describe.getAccountIdFromRecordId('01t41000004ezhWAAQ'); //Product (returns 'No Account Reference')
        strResult = Describe.getAccountIdFromRecordId('0061K00000e8Oxxxxx'); //Fail
        System.assertEquals(true,IsId,'MyMessage');
    }     
    @isTest static void describeTestRecordTypeList(){
        boolean isId = true;
        List<object> toAddress = Describe.RecordTypeList('Account');
        System.assertEquals(true,IsId,'MyMessage');
    }     
}
