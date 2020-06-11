({
	doInit : function(component, event, helper) {
		helper.hlpDoInit(component);
	},
	save : function(component, event, helper) {
		helper.hlpSave(component);
	},
	closeModal : function(component, event, helper) {
		helper.hlpCloseModal(component);
	},
	handleSystemError: function(component, event, helper) {
	    var message = 'Aura System Error, message = ' + event.getParam("message") +
	    				', error = ' + event.getParam("error");
	    helper.showError(component, message);
	},
	checkAllowCreate : function(component, event, helper) {
		helper.hlpAllowCreate(component);
	}
})