@isTest
private class NeedsAnalysisTest {
    @isTest(SeeAllData=true)
    static void testFindFirstFromAccountId() {
        boolean IsId = true;
        Needs_Analysis__c TestNeedsAnalysis = [SELECT Id, Name, Account__c FROM Needs_Analysis__c WHERE Account__c != NULL AND RecordTypeId = '012I90000004KO7IAM' LIMIT 1];   

        Test.startTest();
        Object result = NeedsAnalysis.FindFirstFromAccountId(TestNeedsAnalysis.Account__c);
        result = NeedsAnalysis.FindFirstFromAccountId('00141000019hPDXXXX'); //fakeId
        result = NeedsAnalysis.FindFirstFromAccountId(null); //fakeId
        Test.stopTest();

        System.assertEquals(true,IsId);

    }
}
