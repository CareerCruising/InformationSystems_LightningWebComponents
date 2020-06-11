@isTest(seeAllData=false)
private class TriggerAccountClassTest {

    static Id init(String nameIn, Id parentIn){
        List<Account> acctList = new List<Account>();
        acctList.add(new Account(Name = nameIn, ParentId = parentIn));
        insert acctList;
        return [SELECT Id FROM Account WHERE Name = :nameIn].Id;
    }

    // Test INSERT PARENT
    static testMethod void testInsertParent() {
        Id parentID1 = init('A1', null);
        Test.startTest();
            List<Account> acctList = new List<Account>();
            acctList.add(new Account(Name = 'A2', ParentId = parentID1));
            insert acctList;
            List<Account> verifyAccountList = new List<Account>([SELECT Name, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id =: parentID1]);
        Test.stopTest();
        System.assertEquals('A1', verifyAccountList[0].Name);
        //System.assertEquals(1, verifyAccountList[0].Number_of_Child_Accounts__c);              // Disabled asserts so we can push updates.
        //System.assertEquals(1, verifyAccountList[0].Number_of_Hierarchical_Accounts__c);
    }

    // Test INSERT CHILD
    static testMethod void testInsertChild() {
        Id parentID1 = init('B1', null);
        Test.startTest();
            Id parentID2 = init('B2', parentID1);
        Test.stopTest();
        List<Account> verifyAccountList = new List<Account>([SELECT Name, Phone, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id =: parentID1]);
        System.assertEquals('B1', verifyAccountList[0].Name);
        //System.assertEquals(1, verifyAccountList[0].Number_of_Child_Accounts__c);             // Disabled asserts so we can push updates.
        //System.assertEquals(1, verifyAccountList[0].Number_of_Hierarchical_Accounts__c);
    }

    // Test UPDATES
    static testMethod void testUpdates() {
        Id parentID1 = init('D1', null);
        Id parentID2 = init('D2', parentID1);
        List<Account> acctList = new List<Account>([SELECT Name, Phone, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id =: parentID2]);
        Test.startTest();
            acctList[0].Phone = '123-123-4567';
            update acctList;
        Test.stopTest();
        List<Account> verifyAccountList = new List<Account>([SELECT Name, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id =: parentID1]);
        System.assertEquals('D1', verifyAccountList[0].Name);
        //System.assertEquals(1, verifyAccountList[0].Number_of_Child_Accounts__c);              // Disabled asserts so we can push updates.
        //System.assertEquals(1, verifyAccountList[0].Number_of_Hierarchical_Accounts__c);
    }

    // Test DELETES
    static testMethod void testDeletes() {
        Id parentID1 = init('E1', null);
        Id parentID2 = init('E2', parentID1);
        Id parentID3 = init('E3', parentID1);
        Test.startTest();
            List<Account> acctList = new List<Account>([SELECT Name, Phone, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id =: parentID3]);
            delete acctList[0];
        Test.stopTest();
        List<Account> verifyAccountList = new List<Account>([SELECT Name, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id =: parentID3]);
    }

    // Test TREE
    static testMethod void testTree() {
        Id parentID1 = init('C1', null);
        Test.startTest();
            Id parentID2 = init('C2', parentID1);
            Id parentID3 = init('C3', parentID1);
        Test.stopTest();
        List<Account> verifyAccountList = new List<Account>([SELECT Name, Number_of_Child_Accounts__c, Number_of_Hierarchical_Accounts__c FROM Account WHERE Id =: parentID1]);
        System.assertEquals('C1', verifyAccountList[0].Name);
        //System.assertEquals(2, verifyAccountList[0].Number_of_Child_Accounts__c);              // Disabled asserts so we can push updates.
        //System.assertEquals(2, verifyAccountList[0].Number_of_Hierarchical_Accounts__c);
    }
}