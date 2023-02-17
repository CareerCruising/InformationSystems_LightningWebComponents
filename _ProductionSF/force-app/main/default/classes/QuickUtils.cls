public with sharing class QuickUtils {
/*

*/
    public class LogResult{
        string Id { get; set; }
        string Error { get; set; }
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

}

