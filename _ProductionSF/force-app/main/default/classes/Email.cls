public with sharing class Email {
    /*
        SendEmail({toAddress: ['anthonya@xello.world'], subject: 'My subject', body: 'Html body of email'})
        SendEmail({toAddress: ['anthonya@xello.world'], subject: 'My subject', body: 'Html body of email'})
    */   
    public class LogResult{
        string Id { get; set; }
        string Error { get; set; }
    }

    @AuraEnabled
    public static object sendEmail(List<String> toAddress, String subject, String body) {      
        Messaging.reserveSingleEmailCapacity(1);
        LogResult resultLog = new LogResult();
        resultLog.Error = '';   
        resultLog.Id = '';        
        try{
            messaging.SingleEmailMessage mail = new messaging.SingleEmailMessage();
    
            mail.setToAddresses(toAddress);
            //mail.setReplyTo('no-reply@xooa.com');
            mail.setSenderDisplayName('Salesforce Emails');
            mail.setSubject(subject);
            mail.setHtmlBody(body);
            // mail.setEntityAttachments(files);
            Messaging.sendEmail(new List<messaging.SingleEmailMessage> {mail});
            //return JSON.serialize(resultLog);
            return resultLog;
        }
        catch (exception e){
            resultLog.Error = e.getMessage();
            //return JSON.serialize(resultLog);
            return resultLog;
        }
    }
 
}
