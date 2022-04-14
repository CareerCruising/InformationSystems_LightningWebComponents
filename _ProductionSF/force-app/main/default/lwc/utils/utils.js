export function copyToClipboard(event,text) {
        
    text = text.replace(/(<([^>]+)>)/gi, "\r\n");
    //Hidden input variable
    var hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("value", text);
    
    //Append Hidden Input to the body
    document.body.appendChild(hiddenInput);
    hiddenInput.select();
    
    // Executing the copy command
    document.execCommand("copy");
    document.body.removeChild(hiddenInput); 

} 

export function GeneralToggle(event) {
        
    text = text.replace(/(<([^>]+)>)/gi, "\r\n");
    //Hidden input variable
    var hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("value", text);
    
    //Append Hidden Input to the body
    document.body.appendChild(hiddenInput);
    hiddenInput.select();
    
    // Executing the copy command
    document.execCommand("copy");
    document.body.removeChild(hiddenInput); 

} 