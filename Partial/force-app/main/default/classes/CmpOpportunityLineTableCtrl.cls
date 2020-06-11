/* Class:       CmpOpportunityLineTableCtrl
** Created by:  OpFocus (Veena Sundara-Heragu) on 7/23/18
** Description: 
*/
public with sharing class CmpOpportunityLineTableCtrl
{
    /**
     * Fetch all the existing line items for the Opportunity and specify the column information for the
     * lightning:datatable component
     * @param opportunityId
     * @return
     */
    @AuraEnabled
    public static LightningTableData ctrlFetchLines( String opportunityId)
    {
        try
        {
            LightningTableData retVal = new LightningTableData();

            // get line items for this opportunity
            retVal.lstOLI = [Select Id, Product2.Name, Quantity, UnitPrice, ServiceDate, Description
                                From OpportunityLineItem
                                Where OpportunityId=:opportunityId];



            // build the data for lightning:datatable to display columns
            // this can be done in javascript too
            retVal.lstColumn = new List<LightningDataTableColumn>();
            LightningDataTableColumn col1 = new LightningDataTableColumn();
            col1.fieldName = 'ProductName';
            col1.label = 'Product';
            col1.type = 'text';
            col1.sortable = true;
            col1.editable = false;
            retVal.lstColumn.add(col1);

            LightningDataTableColumn col2 = new LightningDataTableColumn();
            col2.fieldName = 'Quantity';
            col2.label = 'Quantity';
            col2.type = 'number';
            col2.sortable = true;
            col2.editable = true;
            col2.typeAttributes = new LightningDataTableColumn.TypeAttribute();
            col2.typeAttributes.maximumFractionDigits = 0;
            retVal.lstColumn.add(col2);

            LightningDataTableColumn col3 = new LightningDataTableColumn();
            col3.fieldName = 'UnitPrice';
            col3.label = 'Sales Price';
            col3.type = 'number';
            col3.sortable = true;
            col3.editable = true;
            col3.typeAttributes = new LightningDataTableColumn.TypeAttribute();
            //col3.typeAttributes.minimumFractionDigits = 2;
            col3.typeAttributes.maximumFractionDigits = 2;
            retVal.lstColumn.add(col3);

            LightningDataTableColumn col4 = new LightningDataTableColumn();
            col4.fieldName = 'Description';
            col4.label = 'Line Description';
            col4.type = 'text';
            col4.sortable = true;
            col4.editable = true;
            retVal.lstColumn.add(col4);

            LightningDataTableColumn col7 = new LightningDataTableColumn();
            col7.type = 'button';
            col7.typeAttributes = new LightningDataTableColumn.TypeAttribute();
            col7.typeAttributes.iconName = 'utility:delete';
            col7.typeAttributes.label = '';
            col7.typeAttributes.name = 'Delete';
            col7.typeAttributes.title = 'Delete';
            col7.typeAttributes.disabled = false;
            retVal.lstColumn.add(col7);
            
            LightningDataTableColumn col6 = new LightningDataTableColumn();
            col6.type = 'action';
            LightningDataTableColumn.Action ac = new LightningDataTableColumn.Action();
            ac.label = 'Edit';
            ac.name = 'Edit';
            col6.typeAttributes = new LightningDataTableColumn.TypeAttribute();
            col6.typeAttributes.rowActions = new List<LightningDataTableColumn.Action>{ac};
            retVal.lstColumn.add(col6);

            return retVal;
        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occurred:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

    /**
     * Save inline edits made
     * @param opportunityId
     * @param lstUpdateRecords
     * @return
     */
    @AuraEnabled
    public static LightningTableData ctrlSave(String opportunityId, List<OpportunityLineItem>lstUpdateRecords)
    {
        try
        {
            update lstUpdateRecords;
            // fetch the Opportunity Line Items again to display the new information in the component
            return ctrlFetchLines(opportunityId);
        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occurred:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

    /**
     * delete Opportunity Line Item
     * @param opportunityId
     * @param recordId
     * @return
     */
    @AuraEnabled
    public static LightningTableData ctrlDeleteRecord(String opportunityId, String recordId)
    {
        try
        {
            OpportunityLineItem oli = new OpportunityLineItem(Id = recordId);
            delete oli;
            // fetch the Opportunity Line Items again to display the new information in the component
            return ctrlFetchLines(opportunityId);
        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occurred:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
    }

    public Class LightningTableData
    {
        @AuraEnabled public List<OpportunityLineItem> lstOLI;
        @AuraEnabled public List<LightningDataTableColumn> lstColumn;
    }

}