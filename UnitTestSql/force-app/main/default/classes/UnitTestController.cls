public with sharing class UnitTestController {
    @AuraEnabled(cacheable=true)
    public static List<UnitTestResult__c> getSubTestResultList(String SubTest) {
        String v1 = SubTest;
        return [SELECT Name, TestName__c, ResultDescription__c, Columns__c, Json__c FROM UnitTestResult__c WHERE ResultDescription__c = :v1];
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getDistinctTests() {
    
        List<String> retval = new List<String>();

        List<AggregateResult> Agg = [SELECT TestName__c FROM UnitTestResult__c GROUP BY TestName__c];

        String str;

        for (AggregateResult Ag1 : Agg)
        {
            str = Ag1.get('TestName__c').ToString();
            retval.add(str);
        }

        system.debug('===> retval:' + retval.size());

        return retval;
    }

    @AuraEnabled(cacheable=true)
    public static List<String> getDistinctSubTests(String TestName) {
    
        String V1 = TestName;
        List<String> retval = new List<String>();

        List<AggregateResult> Agg = [SELECT ResultDescription__c 
                                    FROM UnitTestResult__c 
                                     WHERE TestName__c = :v1
                                     GROUP BY ResultDescription__c];

        String str;

        for (AggregateResult Ag1 : Agg)
        {
            str = Ag1.get('ResultDescription__c').ToString();
            retval.add(str);
        }

        system.debug('===> retval:' + retval.size());

        return retval;
    }

}
