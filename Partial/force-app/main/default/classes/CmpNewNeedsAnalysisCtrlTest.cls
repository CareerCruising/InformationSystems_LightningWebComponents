/**
 * Created by brendafinn on 2019-05-07.
 */

@IsTest
private class CmpNewNeedsAnalysisCtrlTest {
    @IsTest
    static void testGetRecordTypeIds() {
        CmpNewNeedsAnalysisCtrl.Output results;
        Test.startTest();
            results = CmpNewNeedsAnalysisCtrl.getRecordTypeIds(JSON.serialize(new CmpNewNeedsAnalysisCtrl.Input()));
        Test.stopTest();
        Map<String,Id> mapRtIds = (Map<String,Id>)JSON.deserializeStrict(results.rtIdMapJSON, Map<String, Id>.Class);
        System.assertNOTEquals(0, mapRtIds.size(), 'Failed to populate record type map as expected.');
    }
}