/*
SAMPLES (How to call direct from LWC .js)
import { getTermOptions, Multiply2Numbers, createCookie, getCookie } from 'c/commonJS';

        console.log(getTermOptions());
        console.log('Multiply2Numbers', Multiply2Numbers(3,4));
        console.log(getCookie('UserMethodPortal'));
*/
export { getTermOptions, Multiply2Numbers, createCookie, getCookie, basicTest, JSON_CSV_Download };

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

function basicTest(value) {
    console.log(value);
}

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

function JSON_CSV_Download(objArray, fileName, blHeader, blQuoteWrap) {
    if (blHeader == null) blHeader = true;
    if (blQuoteWrap == null) blQuoteWrap = true;
    objArray = JSON.stringify(objArray);
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';
    var line = '';

    if (blHeader) {
        //////////////////////////////////////////////////////////
        //Build the header
        //////////////////////////////////////////////////////////        
        var header = array[0];
        for (var name in header) {
            if (name.substring(0, 2) != '$$' && name.substring(0, 2) != 'x_') {
                //Only execute if the name is not starting with $$ or x_
                var value = name + "";
                if (value === 'null') value = '';
                if (blQuoteWrap) {
                    line += '"' + value.replace(/"/g, '""') + '",';
                } else {
                    line += name + ',';
                }
            }
            
        }
        line = line.slice(0, -1);
        str += line + '\r\n';
    }

    for (var i = 0; i < array.length; i++) {
        var line = '';

        for (var index in array[i]) {
            if (index.substring(0, 2) != '$$' && index.substring(0, 2) != 'x_') {
                //Only execute if the name is not starting with $$ or x_
                var value = array[i][index] + "";
                if (value === 'null') value = '';
                if (blQuoteWrap) {
                    line += '"' + value.replace(/"/g, '""') + '",';
                } else {
                    line += array[i][index] + ',';
                }
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    //onsole.log(str);
    download('data:text/csv;charset=utf-8,' + encodeURIComponent(str), fileName + '.csv', 'text/csv');
}

function download(data, strFileName, strMimeType) {

    var self = window, // this script is only for browsers anyway...
        u = "application/octet-stream", // this default mime also triggers iframe downloads
        m = strMimeType || u,
        x = data,
        D = document,
        a = D.createElement("a"),
        z = function (a) { return String(a); },
        B = (self.Blob || self.MozBlob || self.WebKitBlob || z);
    B = B.call ? B.bind(self) : Blob;
    var fn = strFileName || "download",
    blob,
    fr;

    if (String(this) === "true") { //reverse arguments, allowing download.bind(true, "text/xml", "export.xml") to act as a callback
        x = [x, m];
        m = x[0];
        x = x[1];
    }

    //go ahead and download dataURLs right away
    if (String(x).match(/^data\:[\w+\-]+\/[\w+\-]+[,;]/)) {
        return navigator.msSaveBlob ?  // IE10 can't do a[download], only Blobs:
            navigator.msSaveBlob(d2b(x), fn) :
            saver(x); // everyone else can save dataURLs un-processed
    }//end if dataURL passed?

    blob = x instanceof B ?
        x :
        new B([x], { type: m });


    function d2b(u) {
        var p = u.split(/[:;,]/),
        t = p[1],
        dec = p[2] == "base64" ? atob : decodeURIComponent,
        bin = dec(p.pop()),
        mx = bin.length,
        i = 0,
        uia = new Uint8Array(mx);

        for (i; i < mx; ++i) uia[i] = bin.charCodeAt(i);

        return new B([uia], { type: t });
    }

    function saver(url, winMode) {

        if ('download' in a) { //html5 A[download] 			
            a.href = url;
            a.setAttribute("download", fn);
            a.innerHTML = "downloading...";
            D.body.appendChild(a);
            setTimeout(function () {
                a.click();
                D.body.removeChild(a);
                if (winMode === true) { setTimeout(function () { self.URL.revokeObjectURL(a.href); }, 250); }
            }, 66);
            return true;
        }

        if (typeof safari !== "undefined") { // handle non-a[download] safari as best we can:
            url = "data:" + url.replace(/^data:([\w\/\-\+]+)/, u);
            if (!window.open(url)) { // popup blocked, offer direct download: 
                if (confirm("Displaying New Document\n\nUse Save As... to download, then click back to return to this page.")) { location.href = url; }
            }
            return true;
        }

        //do iframe dataURL download (old ch+FF):
        var f = D.createElement("iframe");
        D.body.appendChild(f);

        if (!winMode) { // force a mime that will download:
            url = "data:" + url.replace(/^data:([\w\/\-\+]+)/, u);
        }
        f.src = url;
        setTimeout(function () { D.body.removeChild(f); }, 333);

    }//end saver 


    if (navigator.msSaveBlob) { // IE10+ : (has Blob, but not a[download] or URL)
        return navigator.msSaveBlob(blob, fn);
    }

    if (self.URL) { // simple fast and modern way using Blob and URL:
        saver(self.URL.createObjectURL(blob), true);
    } else {
        // handle non-Blob()+non-URL browsers:
        if (typeof blob === "string" || blob.constructor === z) {
            try {
                return saver("data:" + m + ";base64," + self.btoa(blob));
            } catch (y) {
                return saver("data:" + m + "," + encodeURIComponent(blob));
            }
        }

        // Blob but not URL:
        fr = new FileReader();
        fr.onload = function (e) {
            saver(this.result);
        };
        fr.readAsDataURL(blob);
    }
    return true;
}