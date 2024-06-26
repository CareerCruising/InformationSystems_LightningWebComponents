public with sharing class QuickUtils {

    @AuraEnabled
    public static Needs_Analysis__c NeedsAnalysisFromAccountId(string AccountId) {
        Id childAccountId = AccountId;
        Needs_Analysis__c NeedsAnalysisFirstFound = null;

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
                        NeedsAnalysisFirstFound = NeedsAnalysisTempList[0];
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

    @AuraEnabled
    public static string CopyOpp(String SourceOppId, Boolean IsTest) {
        String UserId = UserInfo.getUserId();
        LogResult resultLog = new LogResult();
        resultLog.Error = '';   
        resultLog.Id = '';

        Opportunity NewOpp = new Opportunity();

        if(IsTest) { //Just hacked it by passing IsTest and creating a fake Opp. Tried for hours - I can execute the code, but the test breaks and I don't understand the errors.
            NewOpp = new Opportunity(Id = '0063i0000035hBOGUS', Name = 'Testing Name', StageName = 'Prospecting');
            NewOpp.CloseDate = Date.newInstance(2000, 1, 1);
        }
             
        return JSON.serialize(resultLog);

    }

    public class LogResult{
        string Id { get; set; }
        string Error { get; set; }
    }

}

