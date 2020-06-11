/* 
 * TaskTriggerHandler
 * Created On: 07/26/2018
 * Created By: OpFocus (Brenda Finn)
 * Description:  Handle all events fired on Task object. Methods called from Task.trigger
 *				+rollupActivities : Whenever a Task for a Lead has an field value that meets
 *				a Lead Task Rollup Rule criteria, we need to update our manual rollup field
 *				on the corresponding Lead record that tracks the number of touches it takes
 *				for a Lead to be converted.
 *			    Similarly, need to update rollup value on delete and undelete.
 *
 *			    We use the Lead Task Rollup Rule to define the rule(s) that are
 *			    executed to determine a 'Touch'. Initially, there is a single rule:
 *			    If Task Status is marked as Completed - increment Touches.
 *			    If Task Status is changed from Completed to another status - decrement Touches
 *			    If Task is deleted, decrement Touches
 *			    If task is undeleted AND was Completed, increment Touches
 *
 * @see Task.trigger
 * @see Lead Task Rollup Rule custom metadata type
 */
public with sharing class TaskTriggerHandler {

    /**
     * Rollup all Completed Tasks for a non-converted Lead.
     * If Task is new with status of  Completed, add 1 to Lead TouchCount.
     * If Task Status is updated to Completed, add 1 to Lead TouchCount.
     * If Task Status is updated from Completed to another value, remove 1 to Lead TouchCount.
     * If Task with Status of Completed is deleted, remove 1 to Lead TouchCount.
     * If Task with Status of Completed is undeleted, add 1 to Lead TouchCount.
     *
     * @param tasks List of Tasks to process
     * @param oldTasks Map of Tasks with previous values for comparison
     */
    public static void rollupActivities(List<Task> tasks, Map<Id, Task> oldTasks) {
        Map<String, List<Lead_Task_Rollup_Rule__mdt>> groupedRules = new Map<String, List<Lead_Task_Rollup_Rule__mdt>>();
        String rollupFieldNames = '';
        
        List<Lead_Task_Rollup_Rule__mdt> rules = null;
        if (Test.isRunningTest()) {
            rules = [select DeveloperName, Field_Name__c, Field_Value__c,
                Lead_Rollup_Field_Name__c from Lead_Task_Rollup_Rule__mdt
                where Active__c=true and Is_Test__c=true order by Lead_Rollup_Field_Name__c];
        } else {
            rules = [select DeveloperName, Field_Name__c, Field_Value__c,
                Lead_Rollup_Field_Name__c from Lead_Task_Rollup_Rule__mdt
                where Active__c=true and Is_Test__c=false order by Lead_Rollup_Field_Name__c];            
        }
                
        for (Lead_Task_Rollup_Rule__mdt rule : rules) {
                if (groupedRules.get(rule.Lead_Rollup_Field_Name__c) == null) {
                    groupedRules.put(rule.Lead_Rollup_Field_Name__c, new List<Lead_Task_Rollup_Rule__mdt>());
                    rollupFieldNames += rule.Lead_Rollup_Field_Name__c  + ',';
                }
                System.debug('=====> adding rule ' + rule.DeveloperName + ' for field ' + rule.Lead_Rollup_Field_Name__c);
                groupedRules.get(rule.Lead_Rollup_Field_Name__c).add(rule);
        }
        rollupFieldNames = rollupFieldNames.substringBeforeLast(',');

        Map<Id, List<RollupHelper>> touchesToAdd = new Map<Id, List<RollupHelper>>();
        Map<Id, List<RollupHelper>> touchesToRemove = new Map<Id, List<RollupHelper>>();

        for (Task task : tasks) {
            // if our Task is not for a Lead - do nothing.
            System.debug('=====> Processing Task ' + JSON.serializePretty(task));
            if(task.WhoId == null){
                continue;
            }
            if (!String.valueOf(task.WhoId).startsWith(Lead.SObjectType.getDescribe().getKeyPrefix())) {
                continue;
            }

            if (isAlreadyProcessed(task.Id)) {
                System.debug('=====> already processed task ' + task.Id);
                continue; // already processed this task record in this transaction
            }

            for (String rollupFieldName : groupedRules.keyset()) {
                if (doDecrementRollup(task, groupedRules.get(rollupFieldName), oldTasks)) {
                    System.debug('======> doDocrementRollup() is true for field ' + rollupFieldName);
                    if (touchesToRemove.get(task.WhoId)  == null) {
                        touchesToRemove.put(task.WhoId, new List<RollupHelper>());
                    }
                    RollupHelper helper = new RollupHelper(task, rollupFieldName);
                    helper.addTouch();
                    touchesToRemove.get(task.WhoId).add(helper);
                } else if (doIncrementRollup(task, groupedRules.get(rollupFieldName), oldTasks)) {
                    if (touchesToAdd.get(task.WhoId) == null) {
                        touchesToAdd.put(task.WhoId, new List<RollupHelper>());
                    }
                    RollupHelper helper = new RollupHelper(task, rollupFieldName);
                    helper.addTouch();
                    touchesToAdd.get(task.WhoId).add(helper);
                }
            }
            markAsProcessed(task.Id);
        }

        String leadIds = '';
        for (Id leadId : touchesToAdd.keyset()) {
            leadIds += '\'' + leadId + '\',';
        }
        for (Id leadId : touchesToRemove.keyset()) {
            leadIds += '\'' + leadId + '\',';
        }
        leadIds = leadIds.substringBeforeLast(',');

        if (String.isEmpty(leadIds)) {
            return; // no leads to update
        }
        String queryString = 'select Id, ' + rollupFieldNames + ' from Lead where Id in (' + leadIds +
            ') and IsConverted=false';
        System.debug('====> queryString = ' + queryString);

        Map<Id, Lead> leadsToUpdate = new Map<Id, Lead>();
        for (Lead lead : (List<Lead>)Database.query(queryString)) {
            leadsToUpdate.put(lead.Id, lead);
        }
        if (!touchesToAdd.isEmpty()) {
            for (Id leadId : touchesToAdd.keyset()) {
                Lead lead = leadsToUpdate.get(leadId);
                for (RollupHelper helper : touchesToAdd.get(leadId)) {
                    Decimal touches = (Decimal) lead.get(helper.rollupField);
                    if (touches == null) {
                        touches = 0;
                    }
                    touches += Decimal.valueOf(helper.touches);
                    lead.put(helper.rollupField, touches);
                }
            }
        }

        if (!touchesToRemove.isEmpty()) {
            for (Id leadId : touchesToRemove.keyset()) {
                Lead lead = leadsToUpdate.get(leadId);
                for (RollupHelper helper : touchesToRemove.get(leadId)) {
                    Decimal touches = (Decimal)lead.get(helper.rollupField);
                    if (touches == null) {
                        touches = 0;
                    }
                    System.debug('=====> current touches = ' + touches + ' and touches = ' + helper.touches +
                            ' for rollup Field = ' + helper.rollupField) ;
                    touches -= Decimal.valueOf(helper.touches);
                    if (touches < 0) {
                        touches = 0;
                    }
                    System.debug('=====> setting ' + helper.rollupField + ' = ' + touches);
                    lead.put(helper.rollupField, touches);
                }
            }
        }

        if (!leadsToUpdate.isEmpty()) {
            update leadsToUpdate.values();
        }
    }

    /**
     * Determine if we should decrement the rollup summary field associated with our rules
     *
     * @param task Task to evaluate
     * @param rules Rules to apply to Task - specifies field names and values to compare for its rollup
     * @param oldTasks map of Tasks with old values for comparison on update
     *
     * @return true if rule applies, false otherwise
     */
    private static Boolean doDecrementRollup(Task task, List<Lead_Task_Rollup_Rule__mdt> rules, Map<Id, Task> oldTasks) {

        Boolean blnAnyRuleMet = false;
        Boolean blnAnyRuleMetBefore = false;

        // if deleting and any rule matched for a field before, do decrement
        // if updating and any rule matched for a field before before but none do anymore, do decrement
        for (Lead_Task_Rollup_Rule__mdt rule : rules) {
            System.debug('=====> processing rule for doDecrementRollup : ' + JSON.serializePretty(rule) +
                    ' for rule task = ' + rule.Field_Name__c + ' and value ' + rule.Field_Value__c +
                    ' for task ' + task.get(rule.Field_Name__c));

            if (rule.Field_Name__c != 'Subject') {
                if (task.get(rule.Field_Name__c) == rule.Field_Value__c) {
                    blnAnyRuleMet = true;
                }
                if (!Trigger.isInsert && !Trigger.isUndelete) {
                    if (oldTasks.get(task.Id).get(rule.Field_Name__c) == rule.Field_Value__c) {
                        blnAnyRuleMetBefore = true;
                    }
                }
            } else {
                System.debug('=====> comparing Subject ' + task.Subject + ' to ' + rule.Field_Value__c);
                // if Subject contains expected Field value, then the rule criteria is met
                // 9/10/2018 OpFocus (bfinn) : changed test for indexOf to contactIgnoreCase
                if (task.Subject.containsIgnoreCase(rule.Field_Value__c)) {
                    blnAnyRuleMet = true;
                }
                if (!Trigger.isInsert && !Trigger.isUndelete) {
                    if (oldTasks.get(task.Id).Subject.containsIgnoreCase(rule.Field_Value__c)) {
                        blnAnyRuleMetBefore = true;
                    }
                }
            }
        }

        // task Status==Completed is an overriding requirement for rules being met, now or before
        blnAnyRuleMet = blnAnyRuleMet && (task.Status == 'Completed');
        blnAnyRuleMetBefore = blnAnyRuleMetBefore && (oldTasks.get(task.Id).Status == 'Completed');

        if (Trigger.isDelete) {
          return blnAnyRuleMetBefore;
        }
        else {
            if (blnAnyRuleMetBefore == true && blnAnyRuleMet == false) { return true; }
            else {return false;}
        }
    }

    /**
     * Determine if we should increment the rollup summary based on rules argument. The
     * rules are grouped by Rollup Summary Field. Any rule must be true in order for
     * the rollup summary field to be updated, in addition to Status=Completed
     *
     * @param task Task to evaluate
     * @param rules Rules to apply to Task - specifies field names and values to compare for its rollup
     * @param oldTasks map of Tasks with old values for comparison on update
     *
     * @return true if rule applies, false otherwise
     */
    private static Boolean doIncrementRollup(Task task, List<Lead_Task_Rollup_Rule__mdt> rules, Map<Id, Task> oldTasks) {

        Boolean blnAnyRuleMet = false;
        Boolean blnAnyRuleMetBefore = false;

        // if any rule matched for a field now but not before, do increment
        for (Lead_Task_Rollup_Rule__mdt rule : rules) {
            System.debug('=====> processing rule for doIncrementRollup : ' + JSON.serializePretty(rule) +
                    ' for rule task = ' + rule.Field_Name__c + ' and value ' + rule.Field_Value__c +
                    ' for task ' + task.get(rule.Field_Name__c));

            if (rule.Field_Name__c != 'Subject') {
                if (task.get(rule.Field_Name__c) == rule.Field_Value__c) {
                    blnAnyRuleMet = true;
                }
                if (!Trigger.isInsert && !Trigger.isUndelete) {
                    if (oldTasks.get(task.Id).get(rule.Field_Name__c) == rule.Field_Value__c) {
                        blnAnyRuleMetBefore = true;
                    }
                }
                // 9/10/2018 OpFocus (bfinn) removed else clause that sets blnAnyRuleMetBefore= false since it is set to that at beginning of method
            } else {
                // if Subject contains expected Field value, then the rule criteria is met
                // 9/10/2018 OpFocus (bfinn) : changed test for indexOf to contactIgnoreCase
                if (task.Subject.containsIgnoreCase(rule.Field_Value__c)) {
                    blnAnyRuleMet = true;
                }
                // did we just change the value and meet the rule?
                if (!Trigger.isInsert && !Trigger.isUndelete) {
                    if (oldTasks.get(task.Id).Subject.containsIgnoreCase(rule.Field_Value__c)) {
                        blnAnyRuleMetBefore = true;
                    }
                }
                // 9/10/2018 OpFocus (bfinn) removed else clause that sets blnAnyRuleMetBefore= false since it is set to that at beginning of method
            }
        }

        // task Status==Completed is an overriding requirement for rules being met, now or before
        blnAnyRuleMet = blnAnyRuleMet && (task.Status == 'Completed');
        blnAnyRuleMetBefore = blnAnyRuleMetBefore && (oldTasks.get(task.Id).Status == 'Completed');

        if (Trigger.isInsert || Trigger.isUndelete) {
            return blnAnyRuleMet;
        }
        else {
            if (blnAnyRuleMetBefore == false && blnAnyRuleMet == true) { return true; }
            else {return false;}
        }
    }


    /**
     * Determine if we have already processed this Task in this transaction - to avoid
     * counting the same Task more than once in rollup.
     *
     * @param task Record to review
     *
     * @return true if this Task has already been processed in this transaction,
     *  false otherwise
     */
    private static Boolean isAlreadyProcessed(Id taskId) {
        if (Trigger.isInsert && processedInsertIds.contains(taskId)) {
            return true;
        }
        if (Trigger.isUpdate && processedUpdateIds.contains(taskId)) {
            return true;
        }
        if (Trigger.isDelete && processedDeleteIds.contains(taskId)) {
            return true;
        }
        if (Trigger.isUndelete && processedUndeleteIds.contains(taskId)) {
            return true;
        }
        return false;
    }


    /**
     * Mark task as being processed to avoid counting it twice for Touch Count.
     *
     * @param task record to mark as processed
     */
    private static void markAsProcessed(Id taskId) {
        if (Trigger.isInsert) {
            processedInsertIds.add(taskId);
        }
        if (Trigger.isUpdate) {
            processedUpdateIds.add(taskId);
        }
        if (Trigger.isDelete) {
            processedDeleteIds.add(taskId);
        }
        if (Trigger.isUndelete) {
            processedUndeleteIds.add(taskId);
        }
    }

    public class RollupHelper {
        public Integer touches {get; set;}
        public String rollupField {get; set;}
        public Id leadId {get; set;}

        public RollupHelper(Task task, String rollupFieldName) {
            this.leadId = task.WhoId;
            this.rollupField = rollupFieldName;
            this.touches = 0;
        }

        public void addTouch() {
            touches++;
        }
    }

    // Set of Ids already processed in current transaction - to avoid recursion/reprocessing
    @TestVisible private static Set<Id> processedInsertIds = new Set<Id>();
    @TestVisible private static Set<Id> processedUpdateIds = new Set<Id>();
    @TestVisible private static Set<Id> processedDeleteIds = new Set<Id>();
    @TestVisible private static Set<Id> processedUndeleteIds = new Set<Id>();
}