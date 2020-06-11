public class Util {

    public static Integer countFamilyTreeNodes(Id topAcctId, Map<Id,HierarchyNode> nodes) {
        Set<Id> treeAcctIds = new Set<Id>();
        HierarchyNode refNode = nodes.get(topAcctId);
        if (refNode==null) {
            return 1;
        }
        treeAcctIds = traverseChildren(refNode.children, nodes);
        return treeAcctIds.size();
    }

    public static Integer countChildNodes(Id topAcctId, Map<Id,HierarchyNode> nodes) {
        HierarchyNode refNode = nodes.get(topAcctId);
        if (refNode!=null) {
            return refNode.children.size();
        } else {
            return 0;
        }
    }

    private static Set<Id> traverseChildren(List<HierarchyNode> children, Map<Id,HierarchyNode> nodes) {
        Set<Id> acc_ids = new Set<Id>();
        for (HierarchyNode refNode : children) {
            acc_ids.add(refNode.node.id);
            acc_ids.addAll(traverseChildren(refNode.children, nodes));
        }
        return acc_ids;
    }

    public static Map<Id,HierarchyNode> getAccountHierarchies(List<Account> topAccts) {
        Set<Id> parentAccIds = new Set<Id>();
        for (Account a : topAccts) {
            parentAccIds.add(a.Id);
        }
        return getAccountHierarchies(parentAccIds);
    }

    // GET COMPLETE ACCOUNT HIERARCHIES, E.G. READ ALL CHILD ACCOUNTS GIVEN A LIST OF TOP ACCOUNT IDS. 
    // READ ACCOUNTS 5 LEVELS AT A TIME TO SPEED UP THE READING AND SAVE VALUABLE SOQL-QUERIES.
    public static Map<Id,HierarchyNode> getAccountHierarchies(Set<Id> topAcctIds) {
        Map<Id,HierarchyNode> nodes = new Map<Id,HierarchyNode>();
        Set<Id> parentAccIds = topAcctIds;

        while (parentAccIds.size() > 0) {
            Map<Id,Account> subordinateAccounts =
            new Map<Id,Account>([
                SELECT Id, Name,
                       Number_of_Child_Accounts__c,
                       Number_of_Hierarchical_Accounts__c,
                       ParentID,
                       Parent.ParentID,
                       Parent.Parent.ParentID,
                       Parent.Parent.Parent.ParentID
                FROM   Account
                WHERE (Id IN :parentAccIds) OR
                      (ParentId IN :parentAccIds) OR
                      (Parent.ParentId IN :parentAccIds) OR
                      (Parent.Parent.ParentId IN :parentAccIds) OR
                      (Parent.Parent.Parent.ParentId IN :parentAccIds)]);

            List<Account> level0Accs = new List<Account>();
            List<Account> level1Accs = new List<Account>();
            List<Account> level2Accs = new List<Account>();
            List<Account> level3Accs = new List<Account>();
            List<Account> level4Accs = new List<Account>();

            // Split accounts in levels
            for (Account acc : subordinateAccounts.values()) {
                if (acc.Id != null) {
                    if (parentAccIds.contains(acc.Id)) {
                            level0Accs.add(acc);
                        }
                    else if (acc.ParentId != null) {
                        if (parentAccIds.contains(acc.ParentId)) {
                            level1Accs.add(acc);
                        }
                        else if (acc.Parent.ParentId != null) {
                            if (parentAccIds.contains(acc.Parent.ParentId)) {
                                level2Accs.add(acc);
                            }
                            else if (acc.Parent.Parent.ParentId != null) {
                                if (parentAccIds.contains(acc.Parent.Parent.ParentId)) {
                                    level3Accs.add(acc);
                                }
                                else if (acc.Parent.Parent.Parent.ParentId != null) {
                                    if (parentAccIds.contains(acc.Parent.Parent.Parent.ParentId)) {
                                        level4Accs.add(acc);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            Set<Id> nextParentAccIds = new Set<Id>();
            // Add children on all levels found, one level at a time
            addChildren(level0Accs, nodes, null, true);
            addChildren(level1Accs, nodes, null, false);
            addChildren(level2Accs, nodes, null, false);
            addChildren(level3Accs, nodes, null, false);
            addChildren(level4Accs, nodes, nextParentAccIds, false);
            // Use lowest level of account ids for next SOQL query
            parentAccIds = nextParentAccIds;
        }
        //system.debug('NODES: '+nodes);
        return nodes;
    }   

    // ADD CHILD NODES
    private static void addChildren(List<Account> accs, Map<Id,HierarchyNode> nodes, Set<Id> parentAccIds, Boolean TopAcct) {
        for (Account acc : accs) {
            if (TopAcct) {
                HierarchyNode newNode = new HierarchyNode(acc);
                nodes.put(acc.id, newNode);
            } else {
                HierarchyNode refNode = nodes.get(acc.ParentId);
                HierarchyNode newNode = new HierarchyNode(acc, refNode);
                nodes.put(acc.id, newNode);
                if (refNode != null) {
                    refNode.children.add(newNode);
                }
                if (parentAccIds != null) {
                    parentAccIds.add(acc.id);
                }
            }
        }
    }

    // CLASS THAT IS USED AS NODES IN THE ACCOUNT HIERARCHY TREE BUILT BY THIS CLASS
    public class HierarchyNode {
        public HierarchyNode parent;
        public Account node;
        public List<HierarchyNode> children;

        HierarchyNode(Account acc, HierarchyNode parent) {
            this.parent = parent;
            this.node = acc;
            this.children = new List<HierarchyNode>();
        }

        HierarchyNode(Account acc) {
            this.parent = null;
            this.node = acc;
            this.children = new List<HierarchyNode>();
        }
    }
}