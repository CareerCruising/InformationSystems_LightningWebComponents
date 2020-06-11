trigger OnAccountTrigger on Account (after insert, after update, before insert, before update, before delete) {
    
    TriggerDispatcherMain.Entry('Account',trigger.isBefore, trigger.isDelete, trigger.isAfter, trigger.isInsert, trigger.isUpdate, trigger.isExecuting, trigger.new, trigger.newmap, trigger.old, trigger.oldmap);
}