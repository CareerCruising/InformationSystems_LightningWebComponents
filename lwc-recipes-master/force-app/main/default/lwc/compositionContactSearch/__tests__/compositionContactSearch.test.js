import { createElement } from 'lwc';
import CompositionContactSearch from 'c/compositionContactSearch';
import findContacts from '@salesforce/apex/ContactController.findContacts';

// Mocking imperative Apex method call
jest.mock(
    '@salesforce/apex/ContactController.findContacts',
    () => {
        return {
            default: jest.fn()
        };
    },
    { virtual: true }
);

// Sample data for imperative Apex call
const APEX_CONTACTS_SUCCESS = [
    {
        Id: '0031700000pJRRSAA4',
        Name: 'Amy Taylor',
        Title: 'VP of Engineering',
        Phone: '4152568563',
        Email: 'amy@demo.net',
        Picture__c:
            'https://s3-us-west-1.amazonaws.com/sfdc-demo/people/amy_taylor.jpg'
    }
];

// Sample error for imperative Apex call
const APEX_CONTACTS_ERROR = {
    body: { message: 'An internal server error has occurred' },
    ok: false,
    status: 400,
    statusText: 'Bad Request'
};

describe('c-composition-contact-search', () => {
    beforeAll(() => {
        // We use fake timers as setTimeout is used in the JavaScript file.
        jest.useFakeTimers();
    });

    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // Helper function to wait until the microtask queue is empty. This is needed for promise
    // timing when calling imperative Apex.
    function flushPromises() {
        // eslint-disable-next-line no-undef
        return new Promise((resolve) => setImmediate(resolve));
    }

    it('does not render contact tiles by default', () => {
        // Create initial element
        const element = createElement('c-composition-contact-search', {
            is: CompositionContactSearch
        });
        document.body.appendChild(element);

        // Select rendered contact tile for length check
        const contactTileEls = element.shadowRoot.querySelectorAll(
            'c-contact-tile'
        );
        expect(contactTileEls.length).toBe(0);
    });

    it('renders one contact tile based on user input', () => {
        const USER_INPUT = 'Amy';

        // Assign mock value for resolved Apex promise
        findContacts.mockResolvedValue(APEX_CONTACTS_SUCCESS);

        // Create initial element
        const element = createElement('c-composition-contact-search', {
            is: CompositionContactSearch
        });
        document.body.appendChild(element);

        // Query lightning-input field element
        const inputFieldEl = element.shadowRoot.querySelector(
            'lightning-input'
        );
        inputFieldEl.value = USER_INPUT;
        inputFieldEl.dispatchEvent(new CustomEvent('change'));

        // Run all fake timers.
        jest.runAllTimers();

        // Return an immediate flushed promise (after the Apex call) to then
        // wait for any asynchronous DOM updates. Jest will automatically wait
        // for the Promise chain to complete before ending the test and fail
        // the test if the promise ends in the rejected state.
        return flushPromises().then(() => {
            const contactTileEl = element.shadowRoot.querySelector(
                'c-contact-tile'
            );
            expect(contactTileEl).not.toBeNull();
            expect(contactTileEl.contact.Name).toBe(
                APEX_CONTACTS_SUCCESS[0].Name
            );
        });
    });

    it('renders the error panel when the Apex method returns an error', () => {
        const USER_INPUT = 'invalid';

        // Assign mock value for rejected Apex promise
        findContacts.mockRejectedValue(APEX_CONTACTS_ERROR);

        // Create initial element
        const element = createElement('c-composition-contact-search', {
            is: CompositionContactSearch
        });
        document.body.appendChild(element);

        // Query lightning-input field elements
        const inputFieldEl = element.shadowRoot.querySelector(
            'lightning-input'
        );
        inputFieldEl.value = USER_INPUT;
        inputFieldEl.dispatchEvent(new CustomEvent('change'));

        // Run all fake timers.
        jest.runAllTimers();

        // Return an immediate flushed promise (after the Apex call) to then
        // wait for any asynchronous DOM updates. Jest will automatically wait
        // for the Promise chain to complete before ending the test and fail
        // the test if the promise ends in the rejected state.
        return flushPromises().then(() => {
            const errorPanelEl = element.shadowRoot.querySelector(
                'c-error-panel'
            );
            expect(errorPanelEl).not.toBeNull();
        });
    });
});
