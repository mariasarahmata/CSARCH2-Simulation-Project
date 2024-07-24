const display = document.getElementById("display");
const output = document.getElementById("output");

function appendToDisplay(input) {
    if (display.value == "ERROR"){
        display.value = input;
    } else {
        display.value += input;
    }
}

function backspace() {
    if (display.value == "ERROR"){
        display.value = "";
    } else if (display.value.length > 0) { // Check if there's text to backspace
        display.value = display.value.slice(0, -1);
    }
}

function clearDisplay() {
    display.value = "";
}

function calculate() {
    // Replace all occurrences of minus symbol () with dash sign
    expression = display.value.replace(/\−/g, "-");

    // Replace all occurrences of multiplication symbol to asterisk symbol
    expression = expression.replace(/\×/g, "*");

    // Replace all occurrences of x character to asterisk symbol
    expression = expression.replace(/\x/g, "*");

    // Replace all occurrences of division symbol with forward slash
    expression = expression.replace(/\÷/g, "/");
    
    // Replace all occurrences of caret (^) with Math.pow() for exponentiation
    expression = expression.replace(/\^/g, "**");

    // Wrap the expression in a try-catch block to handle potential errors
    try {
        // output.addEventListener("click", function() {
        //     output.style.display = "block";
        // })

        // Use Function constructor to evaluate the expression
        output.value = Function('return (' + expression + ')')();
    } catch (error) {
        // Return error message if evaluation fails
        output.value = "ERROR";
    }
}


const openButton = document.getElementById("openInput");
const popup = document.getElementById("popup");
const closeButton = document.getElementById("del");

openButton.addEventListener("click", function() {
    popup.style.display = "block";
});

closeButton.addEventListener("click", function() {
    popup.style.display = "none";
});