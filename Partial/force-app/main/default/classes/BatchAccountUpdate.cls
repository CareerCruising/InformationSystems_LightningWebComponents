global class BatchAccountUpdate implements Database.Batchable<sObject> {

// To run this from Anonymous Block:
   // BatchAccountUpdate bau = new BatchAccountUpdate();
   // database.executeBatch(bau);

  global Database.QueryLocator start(Database.BatchableContext BC) {
      String query = 'SELECT Id,Name FROM Account';
      return Database.getQueryLocator(query);
  }
   
  global void execute(Database.BatchableContext BC, List<Account> accList) {
      for(Account acc : accList) {
          acc.Number_of_Child_Accounts__c        = 0; 
          acc.Number_of_Hierarchical_Accounts__c = 0;
      }
      try {
          update accList;
      } catch(Exception e) {
          System.debug(e);
      }
  }
  global void finish(Database.BatchableContext BC) {}
}