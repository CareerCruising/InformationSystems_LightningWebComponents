/*
** Trigger:  Lead
** SObject:  Lead
** Created by OpFocus (Veena Sundara-Heragu) on 10/30/2017
** Description: Trigger for Lead.  Details in LeadTriggerHandler
**              
*/  
trigger Lead on Lead (before insert, before update, before delete, after insert, after update, after delete, after undelete){
    
    if(Trigger.isBefore && Trigger.isInsert)
    {
        // first, try to find a Contact that matches the email and populate Lead fields from Contact
        LeadTriggerHandler.matchContactEmail(Trigger.new);

        // If no Contact was found, sanitize the Company Name
        LeadTriggerHandler.sanitizeCompanyName(Trigger.new);
    }
    if(Trigger.isBefore && Trigger.isUpdate)
    {
        // If email is changed, try to find matching Contact for new email
        LeadTriggerHandler.matchContactEmail(Trigger.new, Trigger.oldMap);

        // if account is entered, pull company, city, state and country from account
        LeadTriggerHandler.getAccountInfo(Trigger.newMap, Trigger.oldMap);
    }
}