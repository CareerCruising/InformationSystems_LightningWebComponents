/*
** Trigger:  Contract
** SObject:  Contract
** Created by OpFocus (Veena Sundara-Heragu) on 6/27/18
** Description: Trigger for Contract.  Details in ContractTriggerHandler
**              
*/
trigger Contract on Contract (before insert, before update, before delete, after insert, after update, after delete, after undelete)
{
    //determine if trigger should run
    if(Utils.dontRunTrigger('Contract')) return;


    // update ContractEndDate__c of parent Account
    if(Trigger.isAfter)
    {
        if(Trigger.isInsert)
        {
            ContractTriggerHandler.updateAccountContractEndDate(Trigger.new);
        }
        if(Trigger.isUpdate)
        {
            ContractTriggerHandler.updateAccountContractEndDate(Trigger.new, Trigger.oldMap);
        }
        if(Trigger.isDelete)
        {
            ContractTriggerHandler.updateAccountContractEndDate(Trigger.old);
        }
    }

}