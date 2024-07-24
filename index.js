const input = document.getElementById("input");
const ouput = document.getElementById("output");
const button = document.getElementById("convert-button");

input.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        button.click();
    }
});

// my test cases are
    //123.45x678^910
    //-101.01x2^5

function convert(){
    var text = input.value;
    var beforeRadixPoint = document.getElementById("beforeRadixPoint");
    var afterRadixPoint = document.getElementById("afterRadixPoint");
    var base = document.getElementById("base");
    var exponent = document.getElementById("exponent");
        
    if (input.value != "") {
        
        //convert to binary
        const patterns = [/(\d+)\.(\d+)x(\d+)\^(\d+)/, /\+(\d+)\.(\d+)x(\d+)\^(\d+)/, /\-(\d+)\.(\d+)x(\d+)\^(\d+)/];
        var i;

        for (i = 0; i < 3; i++){
            let pattern = patterns[i];
            const match = pattern.exec(text);

            //if 101.01x2^5
            // groups[0] = 101
            // groups[1] = 01
            // groups[2] = 2
            // groups[3] = 5
            
            if (match) {
                var sign = document.getElementById("sign");
                var eprime = document.getElementById("eprime");
                var mantissa = document.getElementById("mantissa");
                var hex = document.getElementById("hex");
                
                const groups = match.slice(1); // Get captured groups (excluding whole match)
                
                if (i == 0 || i == 1){
                    sign.textContent = "0";
                } else {
                    sign.textContent = "1";
                }
                // Update the label text
                if (groups[2] == 2){
                    beforeRadixPoint.textContent = groups[0];
                    afterRadixPoint.textContent = groups[1];
                    //test lang if binary arithmetic works
                    let binaryNumber = groups[0];
                    alert(binaryNumber / Number(2).toString(2));
                        //AND IT DOES WOOO
                        //this makes our lives so much easier
                } else if (groups[2] != 2) {
                    let decimalNumber = Number(groups[0]);
                    let binaryNumber = decimalNumber.toString(2);  //toString parameter for radix
                    // alert(binaryNumber / Number(11).toString(2));
                    // beforeRadixPoint.textContent = binaryNumber;
                    afterRadixPoint.textContent = groups[1];
                }
                
                base.textContent = groups[2];
                exponent.textContent = groups[3];
                // Parse the match data here
                break; // Exit the loop if a match is found
            } else {
                alert("input is formatted wrongly");
            }
        }
    } else {
        beforeRadixPoint.textContent = "";
        afterRadixPoint.textContent = "";
        base.textContent = "";
        exponent.textContent = "";
        alert("input is blank");
    }
}