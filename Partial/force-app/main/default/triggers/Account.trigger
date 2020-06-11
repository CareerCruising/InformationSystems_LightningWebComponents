/*
** Trigger:  Account
** SObject:  Account
** Created by OpFocus (Veena Sundara-Heragu) on 07/25/2017
** Description: Trigger for Account.  Details in AccountTriggerHandler
**              
*/	
trigger Account on Account (before insert, before update, before delete, after insert, after update, after delete, after undelete){
	
	//determine if trigger should run
	if(Utils.dontRunTrigger('Account')) return;

	// if name is changed and there is JUST ONE account, make callout
	// we need to do this in after trigger because for insert, account Id will not be available in before trigger
	if(Trigger.isAfter && (Trigger.isInsert || Trigger.isUpdate) )
	{
		AccountTriggerHandler.makeCallout(Trigger.new);
	}

	// update ContractEndDate__c
	// User before trigger since we are updating fields of the Account record
	if(Trigger.isUpdate && Trigger.isBefore)
	{
		AccountTriggerHandler.updateContractEndDate(Trigger.new);
	}
}