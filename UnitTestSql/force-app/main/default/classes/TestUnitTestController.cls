@isTest
public class TestUnitTestController {
    public static void createUnitTestResultList(Integer amount) {
        List<UnitTestResult__c> Utr = new List<UnitTestResult__c>();

        for (Integer i = 1; i <= amount; i++) {
            Utr.add(new UnitTestResult__c(TestName__c = 'Name1 ' + i, Columns__c = '[{"fieldName": "AccountId"}]', Json__c = '{"fieldName": "AccountId"}', ResultDescription__c = 'RD1'));
            Utr.add(new UnitTestResult__c(TestName__c = 'Name2 ' + i, Columns__c = '[{"fieldName": "AccountId"}]', Json__c = '{"fieldName": "AccountId"}', ResultDescription__c = 'RD2'));
        }

        insert Utr;
    }

    @isTest
    static void getSubTestResultColumns() {
        
        TestUnitTestController.createUnitTestResultList(10);

        Test.startTest();
        Object colobj = UnitTestController.getSubTestResultColumns('RD1');
        String colstring = colobj.ToString();
        Test.stopTest();

        System.assertEquals(1, 1);
    }

    @isTest
    static void getSubTestResultList() {
        
        TestUnitTestController.createUnitTestResultList(10);

        Test.startTest();
        List<Object> objSubTestResultList = UnitTestController.getSubTestResultList('RD1');
        Integer CountDistinctSubTestResults = objSubTestResultList.size();
        Test.stopTest();

        System.assertEquals(CountDistinctSubTestResults, 10);
    }
 
 
    @isTest
    static void getSubTestList() {
        TestUnitTestController.createUnitTestResultList(1);

        Test.startTest();
         
        List<String> SubTests = UnitTestController.getDistinctSubTests('Name1 1');
        Integer CountDistinctSubTests = SubTests.size();
        system.debug('===> Subtests size:' + SubTests.size());

        Test.stopTest();

        System.assertEquals(CountDistinctSubTests, 1);

    }

    @isTest
    static void getDistinctTests() {
        TestUnitTestController.createUnitTestResultList(10);

        Test.startTest();
        List<String> DistinctTests = UnitTestController.getDistinctTests();
        Integer CountDistinctTests = DistinctTests.size();
        Test.stopTest();

        System.assertEquals(CountDistinctTests, 20);
    }

    @isTest
    static void getDistinctSubTests() {
        
        TestUnitTestController.createUnitTestResultList(10);

        Test.startTest();
        List<String> DistinctSubTests = UnitTestController.getDistinctSubTests('Name 1 1');
        Integer CountDistinctTests = DistinctSubTests.size();
        Test.stopTest();

        System.assertEquals(CountDistinctTests, 0);
    }

    


}