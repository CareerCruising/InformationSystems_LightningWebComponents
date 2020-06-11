var NewTabFromIsAdmin = {};

function testOpenSubtab() {
    //First find the ID of the primary tab to put the new subtab in
    sforce.console.getEnclosingPrimaryTabId(openSubtab);
}
var openSubtab = function openSubtab(result) {
    //Now that we have the primary tab ID, we can open a new subtab in it
    var primaryTabId = result.id;
    sforce.console.openSubtab(primaryTabId, 'https://xello.lightning.force.com/lightning/r/' + NewTabFromIsAdmin.sfObjectId + '/view', true,
        NewTabFromIsAdmin.tabName, null, openSubtabSuccess, 'salesforceSubtab');
};

var openSubtabSuccess = function openSubtabSuccess(result) {
    //Report whether we succeeded in opening the subtab
    console.log('RESULT', result);
    if (result.success == true) {
        console.log('Subtab successfully opened');
        sforce.console.focusSubtabById(result.id);
    } else {
        console.log('Subtab cannot be opened');
        sforce.console.openPrimaryTab(null, 'https://xello.lightning.force.com/lightning/r/' + NewTabFromIsAdmin.sfObjectId + '/view', true,
            NewTabFromIsAdmin.tabName, openPrimaryTabSuccess, 'salesforceTab');

    }
};

var openPrimaryTabSuccess = function openPrimaryTabSuccess(result) {
    //Report whether we succeeded in opening the subtab
    console.log('RESULT', result);
    if (result.success == true) {
        console.log('Primary tab successfully opened');
        sforce.console.focusPrimaryTabById(result.id);
    } else {
        console.log('Primary tab cannot be opened');
    }
};

//////////////////////////////////////////////////////////////////
function TabRefresh() {
    //First find the ID of the current tab to refresh it
    sforce.console.getEnclosingTabId(refreshSubtab);
}
var refreshSubtab = function refreshSubtab(result) {
    var subTabId = result.id;
    console.log(result);
    sforce.console.refreshSubtabById(subTabId, true, refreshSuccess,false);
};

var refreshSuccess = function refreshSuccess(result) {
    console.log(result);
    //Report whether refreshing the subtab was successful
    if (result.success == true) {
        console.log('Subtab refreshed successfully');
    } else {
        console.log('Subtab did not refresh');
    }
};

//////////////////////////////////////////////////////////////////
window.addEventListener("message", function (event) {
    //if the object has a property called 'sfObjectId' which is a string then we proceed
    if (typeof event.data.sfObjectId == 'string') {
        NewTabFromIsAdmin = event.data;
        testOpenSubtab();
    };
    //if the object has a property called 'sfRefresh' which is a string then we proceed
    if (typeof event.data.TabRefresh == 'string') {
        NewTabFromIsAdmin = event.data;
        TabRefresh();
    };
});