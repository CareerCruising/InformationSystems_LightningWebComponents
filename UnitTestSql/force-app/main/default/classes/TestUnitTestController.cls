@isTest
public class TestUnitTestController {
    public static void createUnitTestResultList(Integer amount) {
        List<UnitTestResult__c> Utr = new List<UnitTestResult__c>();

        for (Integer i = 1; i <= amount; i++) {
            Utr.add(new UnitTestResult__c(TestName__c = 'Name1 ' + i, ResultDescription__c = 'RD1'));
            Utr.add(new UnitTestResult__c(TestName__c = 'Name2 ' + i, ResultDescription__c = 'RD2'));
        }

        insert Utr;
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
}