({
    doInit: function (component, event, helper)
    {
        helper.hlpDoInit(component);
    },
    manageProducts: function (component, event, helper)
    {
        component.find('productsModal').openModal();
    },
    save: function (component, event, helper)
    {
        var lstUpdateRecords = event.getParam('draftValues');
        //console.log('draftValues = ' + JSON.stringify(lstUpdateRecords));
        helper.hlpSave(component, lstUpdateRecords);
    },
    handleRowAction: function (component, event, helper)
    {
        var action = event.getParam('action');
        var row = event.getParam('row');
        //console.log('row = ' + JSON.stringify(row));
        console.log('action name = ' + action.name);
        switch (action.name) {
            case 'Edit':
                component.set("v.editRecordId", row.Id);
                component.set("v.mode", 'Edit');
                break;
            case 'Delete':
                helper.hlpDeleteRecord(component, row);
                break;
        }
    },
    add: function (component, event, helper)
    {
        helper.hlpAdd(component);
    },
    saveEdit: function (component, event, helper)
    {
        component.find("edit").get("e.recordSave").fire();
    },
    handleSaveSuccess: function (component, event, helper)
    {
        helper.hlpHandleSaveSuccess(component);
    },
    cancelEdit: function (component, event, helper)
    {
        component.set('v.mode', 'List');
    },
    setModalTitle: function (component, event, helper)
    {
        helper.hlpSetTitle(component);
    },
})