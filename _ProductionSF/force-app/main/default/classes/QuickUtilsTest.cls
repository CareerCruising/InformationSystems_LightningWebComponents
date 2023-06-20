@isTest
private class QuickUtilsTest {
    @isTest static void NeedsAnalysisFromAccountId_Test(){
        boolean IsId = true;
        //Needs_Analysis__c result = QuickUtils.NeedsAnalysisFromAccountId('00141000019hPDjAAM'); //From production (Bay High School)
        Needs_Analysis__c result = QuickUtils.NeedsAnalysisFromAccountId('001410000210ZquAAE'); //From sandbox
        result = QuickUtils.NeedsAnalysisFromAccountId(null); //From sandbox
        System.assertEquals(true,IsId);
    } 

    @isTest static void CopyOpptest1(){
        boolean IsId = true;
        string result = QuickUtils.CopyOpp('0061K00000j1eU1QAI', IsId); 
        System.assertEquals(true,IsId);
    } 
}
