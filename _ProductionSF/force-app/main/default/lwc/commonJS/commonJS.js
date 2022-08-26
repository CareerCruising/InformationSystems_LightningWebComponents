/*
SAMPLES (How to call direct from LWC .js)
import { getTermOptions, Multiply2Numbers, createCookie, getCookie } from 'c/commonJS';

        console.log(getTermOptions());
        console.log('Multiply2Numbers', Multiply2Numbers(3,4));
        console.log(getCookie('UserMethodPortal'));
*/
const getTermOptions = () => {
    return [
        { label: '20 years', value: 20 },
        { label: '25 years', value: 25 },
    ];
};

const Multiply2Numbers = (Num1, Num2) => {
    var x = Num1 * Num2;
    return x;
};

function createCookie(name, value) {
    document.cookie = name + "=" + escape(value) + "; path=/";
}

function getCookie(name) {
    var MyCookie;
    var cookieString = "; " + document.cookie;
    var parts = cookieString.split("; " + name + "=");
    if (parts.length === 2) {
        return unescape(parts.pop().split(";").shift());
    }
    return null;
}

export { getTermOptions, Multiply2Numbers, createCookie, getCookie };