import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import {
    buildLocationLabel,
    formatTimeWithShortZoneForZone,
    resolveTimeZoneConfig
} from 'c/localTimeUtils';

const ACCOUNT_FIELDS = [
    'Account.BillingStateCode',
    'Account.BillingState',
    'Account.BillingCountryCode',
    'Account.BillingCountry',
    'Account.System__c',
    'Account.System__r.Name',
    'Account.System__r.System_Status__c',
    'Account.Parent.System__c',
    'Account.Parent.System__r.Name',
    'Account.Parent.System__r.System_Status__c'
];

export default class AccountLocalTime extends NavigationMixin(LightningElement) {
    @api objectApiName;
    @api recordId;

    displayedTime;
    localTimeLabel = 'Local Time';
    timezoneKey;
    errorMessage;
    isLoading = true;
    refreshTimeout;
    refreshInterval;
    activeTimeZone;
    initializedRecordId;

    System = {
        Id: null,
        Name: null,
        Status: null,
        Visible: false
    };

    disconnectedCallback() {
        this.clearRefreshTimers();
    }

    @wire(getRecord, { recordId: '$recordId', fields: ACCOUNT_FIELDS })
    wiredAccount({ data, error }) {
        if (error) {
            this.isLoading = false;
            this.errorMessage = 'Unable to load the record data needed for local time.';
            return;
        }

        if (!data) {
            return;
        }

        this.initializeSystem(data);

        const locationInfo = {
            stateCode: getFieldValue(data, 'Account.BillingStateCode'),
            stateLabel: getFieldValue(data, 'Account.BillingState'),
            countryCode: getFieldValue(data, 'Account.BillingCountryCode'),
            countryLabel: getFieldValue(data, 'Account.BillingCountry')
        };

        this.localTimeLabel = buildLocationLabel(locationInfo);

        if (
            this.initializedRecordId === this.recordId &&
            this.displayedTime &&
            !this.shouldRefreshForLocation(locationInfo)
        ) {
            return;
        }

        this.initializedRecordId = this.recordId;
        this.lastLocationInfo = locationInfo;
        this.initializeLocalTime(locationInfo);
    }

    initializeSystem(data) {
        this.System = {
            Id: null,
            Name: null,
            Status: null,
            Visible: false
        };

        if (getFieldValue(data, 'Account.System__c')) {
            this.System = {
                Id: getFieldValue(data, 'Account.System__c'),
                Name: getFieldValue(data, 'Account.System__r.Name'),
                Status: getFieldValue(data, 'Account.System__r.System_Status__c'),
                Visible: true
            };
            return;
        }

        if (getFieldValue(data, 'Account.Parent.System__c')) {
            this.System = {
                Id: getFieldValue(data, 'Account.Parent.System__c'),
                Name: getFieldValue(data, 'Account.Parent.System__r.Name'),
                Status: getFieldValue(data, 'Account.Parent.System__r.System_Status__c'),
                Visible: true
            };
        }
    }

    shouldRefreshForLocation(locationInfo) {
        return (
            locationInfo.stateCode !== this.lastLocationInfo?.stateCode ||
            locationInfo.stateLabel !== this.lastLocationInfo?.stateLabel ||
            locationInfo.countryCode !== this.lastLocationInfo?.countryCode ||
            locationInfo.countryLabel !== this.lastLocationInfo?.countryLabel
        );
    }

    initializeLocalTime(locationInfo) {
        this.clearRefreshTimers();
        this.isLoading = true;

        const timeZoneConfig = resolveTimeZoneConfig(locationInfo);

        if (!timeZoneConfig) {
            this.displayedTime = null;
            this.timezoneKey = null;
            this.activeTimeZone = null;
            this.isLoading = false;
            this.errorMessage = 'No native timezone mapping was found for this address.';
            return;
        }

        this.activeTimeZone = timeZoneConfig.timeZone;
        this.timezoneKey = `${timeZoneConfig.label} (${timeZoneConfig.timeZone})`;
        this.errorMessage = null;
        this.updateDisplayedTime();
        this.startMinuteRefresh();
        this.isLoading = false;
    }

    updateDisplayedTime() {
        this.displayedTime = formatTimeWithShortZoneForZone(this.activeTimeZone);
    }

    startMinuteRefresh() {
        const now = new Date();
        const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());

        this.refreshTimeout = setTimeout(() => {
            this.updateDisplayedTime();
            this.refreshInterval = setInterval(() => {
                this.updateDisplayedTime();
            }, 60000);
        }, msUntilNextMinute);
    }

    clearRefreshTimers() {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }

        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    navigateToSystem() {
        if (!this.System.Id) {
            return;
        }

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.System.Id,
                actionName: 'view'
            }
        });
    }

    get hasTime() {
        return Boolean(this.displayedTime);
    }

}