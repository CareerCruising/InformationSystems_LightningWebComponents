public class TriggerDispatcherMain {

    // List collection of all object records for DML
    public static List<Account> accountsToUpdate = new List<Account>();
    // Static Variables
    public static ITriggerEntry activefunction   = null;
    public static Integer recursiveCounter       = 0;
    public static String originatingEvent        = null;
    
    // INTERFACE DEFINITIONS
    public interface ITriggerEntry {
        // Interface Main Entry method for initial processing
        void MainEntry(String TriggerObject, Boolean IsBefore, Boolean IsDelete, Boolean IsAfter, Boolean IsInsert, Boolean IsUpdate, Boolean IsExecuting, List<SObject> newlist, Map<ID, SObject> newmap, List<SObject> oldlist, Map<ID,SObject> oldmap);
        // Interface In Progress Entry method for additional processing
        void InProgressEntry(String TriggerObject, Boolean IsBefore, Boolean IsDelete, Boolean IsAfter, Boolean IsInsert, Boolean IsUpdate, Boolean IsExecuting, List<SObject> newlist, Map<ID, SObject> newmap, List<SObject> oldlist, Map<ID,SObject> oldmap);
    }

    // MAIN ENTRY METHOD FROM ALL TRIGGERS
    public static void Entry(String TriggerObject, Boolean IsBefore, Boolean IsDelete, Boolean IsAfter, Boolean IsInsert, Boolean IsUpdate, Boolean IsExecuting, List<SObject> newlist, Map<ID, SObject> newmap, List<SObject> oldlist, Map<ID,SObject> oldmap) {
        // CHECK STATIC VARIABLE TO SEE IF WE ARE RE-ENTERING...
        if(activefunction != null) {
            if((TriggerObject == 'Account' && (IsAfter && (IsInsert || IsUpdate))) || (TriggerObject == 'Account' && IsBefore && IsDelete)){
                recursiveCounter++;
                activefunction.InProgressEntry(TriggerObject, IsBefore, IsDelete, IsAfter, IsInsert, IsUpdate, IsExecuting, newlist, newmap, oldlist, oldmap);
                try{
                    if(accountsToUpdate.size()>0) {
                        upsert accountsToUpdate;
                        accountsToUpdate.clear();
                    }
                }catch(DMLException ex){
                    System.debug('Exception is '+ex);
                }
                return;
            } else {
                return;
            }
        } else {
            if (isInsert) {
                originatingEvent = 'Insert';
            } else if (isUpdate) {
                originatingEvent = 'Update';
            } else if (isDelete) {
                originatingEvent = 'Delete';
            }
        }
        // Fire Event when Account is created, updated or deleted and instantiate the interface for Account object
        if(TriggerObject == 'Account' && (IsAfter && (IsInsert || IsUpdate))) {
            activefunction = new TriggerAccountClass();
            activefunction.MainEntry(TriggerObject, IsBefore, IsDelete, IsAfter, IsInsert, IsUpdate, IsExecuting, newlist, newmap, oldlist, oldmap);
        }
        if(TriggerObject == 'Account' && IsBefore && IsDelete) {
            activefunction = new TriggerAccountClass();
            activefunction.MainEntry(TriggerObject, IsBefore, IsDelete, IsAfter, IsInsert, IsUpdate, IsExecuting, newlist, newmap, oldlist, oldmap);
        }
        try{
            if(accountsToUpdate.size()>0) upsert accountsToUpdate;
        }catch(DMLException ex){
            System.debug('Exception is '+ex);
        }
    }
}