/*
** Trigger: NeedsAnalysis
** SObject: Needs_Analysis__c
** Created by J. Pipkin (OpFocus, Inc) on 
*/

trigger NeedsAnalysis on Needs_Analysis__c (before insert, before update, before delete, after insert, after update, after delete){
	
	if(Trigger.isInsert && Trigger.isAfter){
		NeedsAnalysisTriggerHandler.linkToOpportunity(Trigger.new);
		NeedsAnalysisTriggerHandler.linkToAccount(Trigger.new);
	}
}