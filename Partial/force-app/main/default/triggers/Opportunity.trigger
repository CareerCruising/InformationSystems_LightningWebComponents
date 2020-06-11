/*
** Trigger: Opportunity
** SObject: Opportunity
** Created by J. Pipkin (OpFocus, Inc) on Sept 2017
*/

trigger Opportunity on Opportunity (before insert, before update, before delete, after insert, after update, after delete){
  	
    // when there is an attempt to delete an Opportunity check the object netsuite_conn__NetSuite_Financial__c 
    // to see if any records relate to the Opportunity (netsuite_conn__Opportunity__c)
    // if (records exists) display warning This opportunity can not be deleted because there are related financial records.
    // Do not delete Opportunity
    // 
    if (Trigger.isBefore && Trigger.isDelete) {
        List <netsuite_conn__NetSuite_Financial__c> lstFin = [select Id, netsuite_conn__Opportunity__c from netsuite_conn__NetSuite_Financial__c where netsuite_conn__Opportunity__c in :Trigger.oldMap.keySet()];
        Set <Id> setFinOpps = new Set <Id> ();
        for (netsuite_conn__NetSuite_Financial__c n : lstFin) {
            setFinOpps.add(n.netsuite_conn__Opportunity__c);
        }
        for (Opportunity o : Trigger.old) {
            if (setFinOpps.contains(o.Id)) {
                o.addError('This opportunity can not be deleted because there are related financial records');
            }
        }
    }


    //determine if trigger should run
  	if(Utils.dontRunTrigger('Opportunity') && !Test.isRunningTest()) return;
    
    
    
    // if stagename is changed and there is JUST ONE opp, make callout
    // we need to do this in after trigger because for insert, opp Id will not be available in before trigger
    if(Trigger.isAfter && (Trigger.isInsert || Trigger.isUpdate || Trigger.isDelete) )
    {
    	if(Trigger.isDelete)
    	{
    		system.debug('========> in delete');
    	}
        OpportunityTriggerHandler.makeCallout(Trigger.new, Trigger.oldMap);
    }
}