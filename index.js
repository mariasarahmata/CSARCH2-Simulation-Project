document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('convert-button').addEventListener('click', convert);
    document.getElementById('clear-button').addEventListener('click', clearFields);
});

function convert() {
    console.log("Convert function triggered");
    let number = document.getElementById("number").value.trim();
    let base = document.getElementById("base").value;
    let exponent = parseInt(document.getElementById("exponent").value.trim() || "0", 10);
    
    console.log("Number:", number, "Base:", base, "Exponent:", exponent);

    if (!number || isNaN(exponent)) {
        console.error("Input validation failed.");
        alert("Please fill in all fields correctly.");
        return;
    }

    let parsedNumber = parseNumber(number, base);
    console.log("Parsed Number:", parsedNumber);

    let ieee754Binary = decimalToIEEE754(parsedNumber, exponent);
    let hexOutput = binaryToHex(ieee754Binary);

    console.log("IEEE754 Binary:", ieee754Binary, "Hex:", hexOutput);

    document.getElementById("binaryOutput").textContent = ieee754Binary;
    document.getElementById("hexOutput").textContent = hexOutput;
}

function parseNumber(number, base) {
    return base === '10' ? parseFloat(number) : parseInt(number, 2);
}

function decimalToIEEE754(decimal, exponentInput) {
    const sign = decimal < 0 ? 1 : 0;
    decimal = Math.abs(decimal);

    let bias = 127;
    let binary = decimalToBinary(decimal);
    let integerPart = binary.split('.')[0];
    let fractionalPart = binary.split('.')[1] || '';
    let leadingOneIndex = integerPart.length - 1;

    // If the integer part is '0', adjust leadingOneIndex for numbers less than 1
    if (integerPart === "0") {
        let firstOneIndex = fractionalPart.indexOf('1');
        if (firstOneIndex !== -1) {
            leadingOneIndex = -(firstOneIndex + 1); // Adjust index since it's in the fractional part
        } else {
            leadingOneIndex = 0; // Edge case for input being 0
        }
    }

    let exponent = leadingOneIndex + bias + exponentInput;
    let mantissa = (integerPart === "0" ? fractionalPart.substring(1) : fractionalPart).padEnd(23, '0').slice(0, 23);

    let binaryExponent = exponent.toString(2).padStart(8, '0');
    let ieee754Binary = `${sign}${binaryExponent}${mantissa}`;

    console.log(`Decimal: ${decimal}, Binary: ${binary}, Exponent: ${exponent}, IEEE754: ${ieee754Binary}`);
    return ieee754Binary;
}


function binaryToHex(binary) {
    let hex = '';
    for (let i = 0; i < binary.length; i += 4) {
        const chunk = binary.substring(i, i + 4);
        const decimal = parseInt(chunk, 2);
        hex += decimal.toString(16).toUpperCase();
    }
    return hex;
}

function decimalToBinary(decimal) {
    let integerPart = Math.floor(decimal);
    let fractionalPart = decimal - integerPart;
    let binary = integerPart.toString(2);

    if (fractionalPart !== 0) {
        binary += '.';
        let counter = 0;
        while (fractionalPart !== 0 && counter < 32) {
            fractionalPart *= 2;
            let bit = Math.floor(fractionalPart);
            binary += bit;
            fractionalPart -= bit;
            counter++;
        }
    }
    return binary;
}

function clearFields() {
    document.getElementById("number").value = '';
    document.getElementById("exponent").value = '';
    document.getElementById("binaryOutput").textContent = '';
    document.getElementById("hexOutput").textContent = '';
}
