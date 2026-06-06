import { LightningElement, api, wire } from 'lwc';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import {
    buildLocationLabel,
    formatTimeWithShortZoneForZone,
    resolveTimeZoneConfig
} from 'c/localTimeUtils';

const FIELD_CONFIG_BY_OBJECT = {
    Case: {
        stateCodeField: 'Case.Account.BillingStateCode',
        stateLabelField: 'Case.Account.BillingState',
        countryCodeField: 'Case.Account.BillingCountryCode',
        countryLabelField: 'Case.Account.BillingCountry'
    },
    Contact: {
        stateCodeField: 'Contact.Account.BillingStateCode',
        stateLabelField: 'Contact.Account.BillingState',
        countryCodeField: 'Contact.Account.BillingCountryCode',
        countryLabelField: 'Contact.Account.BillingCountry'
    },
    Opportunity: {
        stateCodeField: 'Opportunity.Account.BillingStateCode',
        stateLabelField: 'Opportunity.Account.BillingState',
        countryCodeField: 'Opportunity.Account.BillingCountryCode',
        countryLabelField: 'Opportunity.Account.BillingCountry'
    },
    System__c: {
        stateCodeField: 'System__c.Account__r.BillingStateCode',
        stateLabelField: 'System__c.Account__r.BillingState',
        countryCodeField: 'System__c.Account__r.BillingCountryCode',
        countryLabelField: 'System__c.Account__r.BillingCountry'
    },
    Lead: {
        stateCodeField: 'Lead.StateCode',
        stateLabelField: 'Lead.State',
        countryCodeField: 'Lead.CountryCode',
        countryLabelField: 'Lead.Country'
    }
};

export default class LocalTime extends LightningElement {
    @api objectApiName;
    @api recordId;

    fieldConfig;
    recordFields = [];
    displayedTime;
    localTimeLabel = 'Local Time';
    timezoneKey;
    errorMessage;
    isLoading = true;
    refreshTimeout;
    refreshInterval;
    activeTimeZone;
    lastLocationInfo;

    connectedCallback() {
        this.fieldConfig = FIELD_CONFIG_BY_OBJECT[this.objectApiName];

        if (!this.fieldConfig) {
            this.isLoading = false;
            this.errorMessage = `Object ${this.objectApiName} is not supported by this component.`;
            return;
        }

        this.recordFields = [
            this.fieldConfig.stateCodeField,
            this.fieldConfig.stateLabelField,
            this.fieldConfig.countryCodeField,
            this.fieldConfig.countryLabelField
        ];
    }

    disconnectedCallback() {
        this.clearRefreshTimers();
    }

    @wire(getRecord, { recordId: '$recordId', fields: '$recordFields' })
    wiredRecord({ data, error }) {
        if (!this.fieldConfig) {
            return;
        }

        if (error) {
            this.isLoading = false;
            this.errorMessage = 'Unable to load the record data needed for local time.';
            return;
        }

        if (!data) {
            return;
        }

        const locationInfo = {
            stateCode: getFieldValue(data, this.fieldConfig.stateCodeField),
            stateLabel: getFieldValue(data, this.fieldConfig.stateLabelField),
            countryCode: getFieldValue(data, this.fieldConfig.countryCodeField),
            countryLabel: getFieldValue(data, this.fieldConfig.countryLabelField)
        };

        this.localTimeLabel = buildLocationLabel(locationInfo);

        if (!this.hasAnyLocationValue(locationInfo)) {
            this.clearRefreshTimers();
            this.displayedTime = null;
            this.timezoneKey = null;
            this.activeTimeZone = null;
            this.isLoading = false;
            this.errorMessage = `No state/province or country value was found on this ${this.objectApiName} record.`;
            return;
        }

        if (this.isSameLocation(locationInfo) && this.displayedTime) {
            return;
        }

        this.lastLocationInfo = locationInfo;
        this.initializeLocalTime(locationInfo);
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

    hasAnyLocationValue(locationInfo) {
        return Boolean(
            locationInfo.stateCode ||
                locationInfo.stateLabel ||
                locationInfo.countryCode ||
                locationInfo.countryLabel
        );
    }

    isSameLocation(locationInfo) {
        return (
            locationInfo.stateCode === this.lastLocationInfo?.stateCode &&
            locationInfo.stateLabel === this.lastLocationInfo?.stateLabel &&
            locationInfo.countryCode === this.lastLocationInfo?.countryCode &&
            locationInfo.countryLabel === this.lastLocationInfo?.countryLabel
        );
    }

    get hasTime() {
        return Boolean(this.displayedTime);
    }

}