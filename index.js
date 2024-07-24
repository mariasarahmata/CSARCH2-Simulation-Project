function convert() {
    let number = document.getElementById("number").value.trim();
    let base = document.getElementById("base").value;
    let exponent = parseInt(document.getElementById("exponent").value.trim() || "0", 10);
    
    if (!number || isNaN(exponent)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    // Parse the number according to the selected base
    let parsedNumber = parseNumber(number, base);
    
    let ieee754Binary = decimalToIEEE754(parsedNumber, exponent);
    let hexOutput = binaryToHex(ieee754Binary);

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

    let exponent = leadingOneIndex + bias + exponentInput;
    let mantissa = (integerPart.substr(1) + fractionalPart).padEnd(23, '0').slice(0, 23);

    let binaryExponent = exponent.toString(2).padStart(8, '0');
    return `${sign}${binaryExponent}${mantissa}`;
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

// Add event listeners to buttons
document.getElementById("convert-button").addEventListener("click", convert);
document.getElementById("clear-button").addEventListener("click", clearFields);
