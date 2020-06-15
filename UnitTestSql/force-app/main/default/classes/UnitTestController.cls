public with sharing class UnitTestController {
    @AuraEnabled(cacheable=true)
    public static Object getSubTestResultColumns(String SubTest) {
        String v1 = SubTest;
        List<UnitTestResult__c> Ulist =  [SELECT Columns__c FROM UnitTestResult__c WHERE ResultDescription__c = :v1];
        String columnjson = Ulist[0].Columns__c;
        Object result;
        result = (Object) JSON.deserializeUntyped(columnjson);
        system.debug('==> Columns: ' + result);

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<Object> getSubTestResultList(String SubTest) {
        String v1 = SubTest;
        List<UnitTestResult__c> Ulist =  [select Json__c FROM UnitTestResult__c WHERE ResultDescription__c = :v1];
        

        Object result;
        List<Object> results = new List<Object>{};

        for(UnitTestResult__c testResult : Ulist){
            result = (Object) JSON.deserializeUntyped(testResult.Json__c);
            results.add(result);
        }    
        return results;

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
