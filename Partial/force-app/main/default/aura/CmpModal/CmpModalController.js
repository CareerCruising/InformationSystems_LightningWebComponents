({

    openModal : function(component, event, helper) {
        component.set("v.modalClassName", "slds-modal slds-fade-in-open");
        component.set("v.backdropClassName", "slds-backdrop slds-backdrop--open");
    },

    closeModal : function(component, event, helper) {
        component.set("v.modalClassName", "slds-modal");
        component.set("v.backdropClassName", "slds-backdrop");
    },
    
})