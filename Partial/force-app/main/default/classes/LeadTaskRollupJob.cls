/* 
 * LeadTaskRollupJob
 * Created On: 08/15/2018
 * Created By: OpFocus (Brenda Finn)
 * Description:  Job to backfill the Lead Calls and Lead Emails field on Lead for all
 * 				Activities created prior to trigger on Task to rollup automatically.
 * 
 *			    If Task Status is Completed and SubType = Email, increment Lead Emails
 *			    If Task Status is Completed and SubType = Call, increment Lead Calls
 *
 * @see Task.trigger
 * @see Lead Task Rollup Rule custom metadata type
 */
global class LeadTaskRollupJob implements Database.Batchable<sObject>, Database.Stateful {

    global List<String> messages = new List<String>();
    global LeadTaskRollupJob() {}
    
    global Database.QueryLocator start(Database.BatchableContext BC) {
        String query = 'SELECT Id,Name FROM Lead where ((Lead_Calls__c=0 or Lead_Calls__c=null) ' + 
            'or (Lead_Emails__c=null or Lead_Emails__c=0)) and Activity_Rollups_Calculated__c=false';
        return Database.getQueryLocator(query);
    }
   
    global void execute(Database.BatchableContext BC, List<Lead> leads) {
        try {
            Boolean blnProcessedLeads = false;
            Map<Id, LeadTouchHelper> helpers = new Map<Id, LeadTouchHelper>();
	        Map<Id, Lead> mapLeads = new Map<Id, Lead>();
            for (Lead lead : leads) {
                mapLeads.put(lead.Id, new Lead(Id=lead.Id, Lead_Calls__c=0, Lead_Emails__c=0));
            }
            for (Task task : [select Id, WhoId, Subject, TaskSubtype from Task where WhoId in:mapLeads.keyset() and 
                              Status='Completed' and 
                              (TaskSubtype ='Email' or TaskSubtype ='Call')]) {
            	LeadTouchHelper helper = helpers.get(task.WhoId);
                if (helper == null) {
                    helper = new LeadTouchHelper(mapLeads.get(task.whoId));
                	helpers.put(task.WhoId, helper);                      
                }
                messages.add('Rolledup Task ' + task.Subject + '(Id=' + task.Id + 
                	') of TaskSubtype ' + task.TaskSubtype + ' for Lead ' + task.WhoId);
                if (task.TaskSubtype  == 'Email') {
               		helper.numEmails++;
                } else if (task.TaskSubtype  == 'Call') {
		            helper.numCalls++;
  	            }
                helper.lead.Activity_Rollups_Calculated__c = true;
            }
            if (!helpers.isEmpty()) {
                List<Lead> leadsToProcess = new List<Lead>();
                for (LeadTouchHelper helper : helpers.values()) {
                    helper.populateCounts();
                    leadsToProcess.add(helper.lead);
                }
                update leadsToProcess;
            }
        } catch(Exception e) {
            String errorMsg = 'Error updating Lead Calls and Lead Emails. Exception = ' + 
                e.getMessage() + ', Cause = ' + e.getCause() + ', Stack Trace = ' + e.getStackTraceString();
            System.debug(errorMsg);
            messages.add(errorMsg);
        }
    }

    global void finish(Database.BatchableContext BC) {
        String body = '';
        for (String message : messages) {
            body += message + '\n\r';
        }
      	Messaging.SingleEmailMessage emailMsg = new Messaging.SingleEmailMessage();
        emailMsg.setSubject('LeadTaskRollupJob Results ' + Date.today().format());
        emailMsg.setToAddresses(new List<String>{'activations@opfocus.com'});
        emailMsg.setPlainTextBody(body);
    	Messaging.sendEmail(new List<Messaging.SingleEmailMessage>{emailMsg});
    }
    
    public class LeadTouchHelper {
        public Lead lead {get; set;}
        public Integer numCalls {get; set;}
        public Integer numEmails {get; set;}
        
        public LeadTouchHelper(Lead lead) {
            this.lead = lead;
            this.numCalls = 0;
            this.numEmails = 0;
        }
        
        public void populateCounts() {
            this.lead.Lead_Calls__c = numCalls;
            this.lead.Lead_Emails__c = numEmails;
        }
    }
}