public with sharing class NeedsAnalysis {

    /*--------------------------------------------------------------------------------------
    Author: Anthony Abbott June 20, 2023
    Description:    When on an account, we want to find the first Needs Analysis found by traversing up the hierarchy
                    This returns the object (instead of Needs_Analysis__c) since we may want other values in the future that are not in the object itself
    --------------------------------------------------------------------------------------*/
    @AuraEnabled
    public static object FindFirstFromAccountId(string AccountId) {
        Id childAccountId = AccountId;
        Map<String, Object> NeedsAnalysisFirstFound = new Map<String, Object>(); //Create a dynamic object

        //Loop up through the hierarchy until we find a Needs Analysis (or reach the top)
        while (childAccountId != null) {
            try {
                Account childAccount = [SELECT Id, Name, ParentId FROM Account WHERE Id = :childAccountId LIMIT 1];
                if (childAccount != null) {
                    childAccountId = childAccount.ParentId;
    
                    //We found an account, check to see if it has a Needs Analysis
                    List<Needs_Analysis__c> NeedsAnalysisTempList = [
                        SELECT Id, Name, LastModifiedDate, LastModifiedBy.FirstName, LastModifiedBy.LastName
                        FROM Needs_Analysis__c
                        WHERE Account__c = :childAccount.Id
                            AND RecordTypeId = '012I90000004KO7IAM'
                        LIMIT 1
                    ];    
                    if (NeedsAnalysisTempList.size() > 0) { //found a Needs Analysis, exit the loop
                        NeedsAnalysisFirstFound.put('NeedsId', NeedsAnalysisTempList[0].Id);
                        NeedsAnalysisFirstFound.put('AccountName', childAccount.Name);
                        NeedsAnalysisFirstFound.put('LastModifiedDate', NeedsAnalysisTempList[0].LastModifiedDate);
                        NeedsAnalysisFirstFound.put('LastModifiedFirstName', NeedsAnalysisTempList[0].LastModifiedBy.FirstName);
                        NeedsAnalysisFirstFound.put('LastModifiedLastName', NeedsAnalysisTempList[0].LastModifiedBy.LastName);
                        childAccountId = null;
                    }        
                } else { //There are no more parent account records, exit the loop
                    childAccountId = null;
                }   
            } catch (Exception e) {
                childAccountId = null;
            }
        }

        return (NeedsAnalysisFirstFound);
    }
}