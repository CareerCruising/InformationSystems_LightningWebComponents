public class TriggerAccountClass implements TriggerDispatcherMain.ITriggerEntry {

    private Integer cntChildren = 0;
    private Map<Id, Util.HierarchyNode> myNodes = new Map<Id, Util.HierarchyNode>();

    public void MainEntry(String TriggerObject, Boolean IsBefore, Boolean IsDelete, Boolean IsAfter, Boolean IsInsert, Boolean IsUpdate, Boolean IsExecuting, List<SObject> newList, Map<ID, SObject> newMap, List<SObject> oldList, Map<ID,SObject> oldMap){
        System.Debug('\n\nInside MainEntry:ORIGINATINGEVENT'+TriggerDispatcherMain.originatingEvent);
        // Cast lists and maps to Account object
        List<Account>    acNewList = (List<Account>)newList;
        Map<ID, Account> acNewMap  = (Map<ID,Account>)newMap;
        List<Account>    acOldList = (List<Account>)oldList;
        Map<ID, Account> acOldMap  = (Map<ID,Account>)oldMap;
        TriggerDispatcherMain.accountsToUpdate = CountChildrenForParents(IsBefore, IsDelete, IsAfter, IsInsert, IsUpdate, IsExecuting, acNewList, acNewMap, acOldList, acOldMap);
    }

    public void InProgressEntry(String TriggerObject, Boolean IsBefore, Boolean IsDelete, Boolean IsAfter, Boolean IsInsert, Boolean IsUpdate, Boolean IsExecuting, List<SObject> newList, Map<ID, SObject> newMap, List<SObject> oldList, Map<ID,SObject> oldMap) {
        System.Debug('Inside InProgressEntry:ORIGINATINGEVENT'+TriggerDispatcherMain.originatingEvent);
        // Cast lists and maps to Account object
        List<Account>    acNewList = (List<Account>)newList;
        Map<ID, Account> acNewMap  = (Map<ID,Account>)newMap;
        List<Account>    acOldList = (List<Account>)oldList;
        Map<ID, Account> acOldMap  = (Map<ID,Account>)oldMap;
        TriggerDispatcherMain.accountsToUpdate = CountChildrenForParents(IsBefore, IsDelete, IsAfter, IsInsert, IsUpdate, IsExecuting, acNewList, acNewMap, acOldList, acOldMap);
    }

    private List<Account> CountChildrenForParents(Boolean IsBefore, Boolean IsDelete, Boolean IsAfter, Boolean IsInsert, Boolean IsUpdate, Boolean IsExecuting, List<Account> acNewList, Map<ID, Account> acNewMap, List<Account> acOldList, Map<ID,Account> acOldMap){
        List<Account> acctParent = new List<Account>();
        List<Account>  acctChild = new List<Account>();
        Set<Id> Ids= new Set<Id>();
        // Gather Record IDs for Inserts, Updates & Deletes
        if(isInsert){
            for(Account acct: acNewList){
                if(acct.ParentId!=null)
                    Ids.add(acct.ParentId);
            }
        }
        if(isUpdate){
            for(Account acct: acNewList){
                Id OldParentId = acOldMap.get(acct.Id).ParentId;
                if(acct.ParentId==null && acOldMap.get(acct.Id).ParentId !=null){
                    Ids.add(OldParentId);
                }else if(acct.ParentId!=null){
                    Ids.add(OldParentId);
                    Ids.add(acct.ParentId);
                }
            }
        }
        if(isDelete){
            for(Account acct: acOldList){
                if(acct.ParentId!=null) Ids.add(acct.ParentId);
            }
        }

        //system.debug('Ids Size>>>'+Ids.size());
        //system.debug('Ids>>>'+Ids);
        if(Ids.size()>0){
            // Initialize Account Nodes for Family Tree
            if (Ids.contains(null)) {
                Ids.remove(null);
                system.debug('removed a NULL element');
            }
            myNodes = Util.getAccountHierarchies(Ids);
            // Now get the Child/Parent records
            acctParent = new List<Account>([SELECT Id, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id IN: Ids]);
            acctChild = new List<Account>([SELECT Id, ParentId FROM Account WHERE ParentId IN: Ids]);
            //system.debug('Parent List >>>'+acctParent);
            //system.debug('Child List >>>'+acctChild);
            // Iterate through all records counting children for each parent.
            for(Account ap: acctParent){
                // Use the Nodes for AFTER events and Subtract from the Nodes for BEFORE events
                if(TriggerDispatcherMain.originatingEvent=='Insert' || TriggerDispatcherMain.originatingEvent=='Update'){
                    ap.Number_of_Hierarchical_Accounts__c  = Util.countFamilyTreeNodes(ap.Id, myNodes);
                    ap.Number_of_Child_Accounts__c         = Util.countChildNodes(ap.Id, myNodes);
                } else if(TriggerDispatcherMain.originatingEvent=='Delete'){
                    ap.Number_of_Hierarchical_Accounts__c  = ap.Number_of_Hierarchical_Accounts__c - 1;
                    ap.Number_of_Child_Accounts__c         = ap.Number_of_Child_Accounts__c - 1;
                }
            }
        }
        // Finally, all families are accounted for, so let's return the Parents with updated counts.
        return acctParent;
    }
}