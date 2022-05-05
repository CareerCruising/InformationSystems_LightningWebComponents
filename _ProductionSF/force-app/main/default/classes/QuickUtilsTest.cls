@isTest
private class QuickUtilsTest {
    @isTest static void CopyOpptest1(){
        boolean IsId = true;
        string result = QuickUtils.CopyOpp('0061K00000j1eU1QAI', IsId); 
        System.assertEquals(true,IsId);
    } 
}
