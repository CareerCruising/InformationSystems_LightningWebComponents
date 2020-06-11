({
	init : function(component, event, helper) {
		try{
			helper.initData(component);
		}
		catch(e){
			component.notify(e, 'JS: CmpNeedsAnalysisController');
		}
	},

	editNA : function(component, event, helper){
		var editRecordEvent = $A.get("e.force:editRecord");
        editRecordEvent.setParams({
            "recordId": component.get("v.naid")
        });
        editRecordEvent.fire();
	},

	doneEditing : function(component, event, helper){
		component.find('editmodal').closeModal();
	}
})