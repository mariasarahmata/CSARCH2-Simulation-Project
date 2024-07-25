document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('convert-button').addEventListener('click', convert);
    document.getElementById('clear-button').addEventListener('click', clearFields);
});

function convert() {
    let number = document.getElementById('number').value.trim();
    let base = document.getElementById('base').value;
    let exponent = parseInt(document.getElementById('exponent').value.trim() || "0", 10);

    if (!number || isNaN(exponent)) {
        alert("Please fill in all fields correctly.");
        return;
    }

    let parsedNumber = parseNumber(number, base);
    let ieee754Binary = decimalToIEEE754(parsedNumber, exponent);
    let hexOutput = binaryToHex(ieee754Binary);

    document.getElementById('binaryOutput').textContent = ieee754Binary;
    document.getElementById('hexOutput').textContent = hexOutput;
}

function parseNumber(number, base) {
    return base === '10' ? parseFloat(number) : parseInt(number, 2);
}

function decimalToIEEE754(decimal, exponentInput) {
    const sign = decimal < 0 ? 1 : 0;
    decimal = Math.abs(decimal);

    let binary = decimalToBinary(decimal);
    let mantissa;
    let exponent;

    if (decimal >= 1) {
        // Normalize for numbers greater than or equal to 1
        let integerPart = binary.split('.')[0];
        let fractionalPart = binary.split('.')[1] || '';
        let shift = integerPart.length - 1;
        exponent = 127 + shift + exponentInput; // Adjust exponent based on shift and bias
        mantissa = (integerPart.substr(1) + fractionalPart).padEnd(23, '0').substring(0, 23);
    } else {
        // Normalize for numbers less than 1
        let shift = binary.substring(1).indexOf('1') + 1;
        exponent = 127 - shift + exponentInput; // Adjust exponent for numbers less than 1
        mantissa = binary.substring(shift + 2).padEnd(23, '0').substring(0, 23);
    }

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
    document.getElementById('number').value = '';
    document.getElementById('exponent').value = '';
    document.getElementById('binaryOutput').textContent = '';
    document.getElementById('hexOutput').textContent = '';
}
