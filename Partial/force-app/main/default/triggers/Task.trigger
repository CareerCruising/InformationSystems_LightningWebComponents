/* 
 * Task
 * Created On: 07/26/2018
 * Created By: OpFocus (Brenda Finn)
 * Description: Handle all events for the Task record. Functionality is in TaskTriggerHandler.
 *
 * @see TaskTriggerHandler.cls
 */

trigger Task on Task (after insert, after update, before delete, after undelete) {
    //determine if trigger should run
    if(Utils.dontRunTrigger('Task') && !Test.isRunningTest()) return;

    if((Trigger.isAfter && (Trigger.isInsert || Trigger.isUpdate || Trigger.isUndelete)) ||
            (Trigger.isBefore && Trigger.isDelete)) {
        if (Trigger.isDelete) {
            TaskTriggerHandler.rollupActivities(Trigger.old, Trigger.oldMap);
        } else {
            TaskTriggerHandler.rollupActivities(Trigger.new, Trigger.oldMap);
        }
    }
}