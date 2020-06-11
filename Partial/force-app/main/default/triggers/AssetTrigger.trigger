/*
** Trigger: AssetTrigger
** SObject: Asset
** Created by J. Pipkin (OpFocus, Inc) on Sept 2017
*/

trigger AssetTrigger on Asset (before insert, before update, before delete, after insert, after update, after delete){
	
	//determine if trigger should run
	if(Utils.dontRunTrigger('AssetTrigger')) return;


	// if name is changed and there is JUST ONE opp, make callout
	// we need to do this in after trigger because for insert, opp Id will not be available in before trigger
	if(Trigger.isAfter && (Trigger.isInsert || Trigger.isUpdate || Trigger.isDelete) )
	{
		AssetTriggerHandler.makeCallout(Trigger.new, Trigger.oldMap);
	}
}