document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('convert-button').addEventListener('click', convert);
    document.getElementById('clear-button').addEventListener('click', clearFields);
    document.getElementById('download-button').addEventListener('click', downloadOutput); 
});

// Handles the conversion based on the input values
function convert() {
    let number = document.getElementById("number").value.trim();
    let base = document.getElementById("base").value;
    let exponent = parseInt(document.getElementById("exponent").value.trim() || "0", 10);

    // Check if the number is NaN (case insensitive)
    if (number.toLowerCase() === 'nan') {
        handleNaN();
        return;
    }

    if (!number || isNaN(exponent)) {
        alert("Please ensure all fields are filled in correctly.");
        return;
    }

    let result = base === '2' ? convertBase2(number, exponent) : convertBase10(number, exponent);
    document.getElementById('binaryOutput').textContent = result.binary;
    document.getElementById('hexOutput').textContent = result.hex;
}

// Convert a binary string to IEEE-754 format
function convertBase2(binaryString, exponent) {
    // If input is NaN, handle it
    if (binaryString.toLowerCase() === 'nan') {
        return handleNaN();
    }

    let sign = binaryString[0] === '-' ? '1' : '0';
    if (sign === '1') binaryString = binaryString.substring(1); // Remove sign for processing
    let normalized = normalizeBinary(binaryString);
    let binary = formatIEEE754(sign, normalized.exponent + exponent + 127, normalized.mantissa);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

// Convert a decimal string to IEEE-754 format
function convertBase10(decimalString, exponent) {
    // If input is NaN, handle it
    if (decimalString.toLowerCase() === 'nan') {
        return handleNaN();
    }

    let decimalValue = parseFloat(decimalString);
    let sign = decimalValue < 0 ? '1' : '0';
    decimalValue = Math.abs(decimalValue);

    let binaryConversion = toBinary(decimalValue);
    let normalized = normalizeBinary(binaryConversion);
    let binary = formatIEEE754(sign, normalized.exponent + exponent + 127, normalized.mantissa);
    let hex = binaryToHex(binary);
    return {binary, hex};
}

// Handles the NaN case
function handleNaN() {
    // NaN is represented by: sign bit = 0, exponent = all 1s, mantissa = non-zero
    let binary = '0 11111111 10000000000000000000000';
    let hex = '7FC00000';

    // Display the NaN result
    document.getElementById('binaryOutput').textContent = binary;
    document.getElementById('hexOutput').textContent = hex;

    return { binary, hex };
}

// Converts a decimal number to a binary string
function toBinary(decimal) {
    let integerPart = Math.floor(decimal);
    let fractionalPart = decimal - integerPart;
    let binary = integerPart.toString(2);

    // Handling the fractional part for single precision (23 bits needed for mantissa)
    if (fractionalPart !== 0) {
        binary += '.';
        let counter = 0;
        // Only loop until you've resolved up to 23 bits of precision or the fractional part resolves to zero
        while (fractionalPart !== 0 && counter < 23) {
            fractionalPart *= 2;
            let bit = Math.floor(fractionalPart);
            binary += bit;
            fractionalPart -= bit;
            counter++;
        }
    }
    return binary;
}

// Normalize a binary string for IEEE-754 conversion
function normalizeBinary(binaryString) {
    let parts = binaryString.split('.');
    let integerPart = parts[0];
    let fractionalPart = parts.length > 1 ? parts[1] : '';
    let shift, normalizedMantissa;

    // Handle numbers less than 1 where integer part is '0'
    if (integerPart === '0' || integerPart === '') {
        // Find the first '1' in the fractional part to determine the shift
        let firstOneIndex = fractionalPart.indexOf('1');
        if (firstOneIndex === -1) {
            // The number is actually zero
            return { mantissa: '0'.repeat(23), exponent: -127 }; // Exponent for zero in IEEE-754
        }
        // Adjust the fractional part to start after the first '1'
        normalizedMantissa = fractionalPart.substring(firstOneIndex + 1);
        shift = -firstOneIndex - 1; // Negative because we are shifting to the right
    } else {
        // For numbers with a non-zero integer part, normalize based on the location of the first '1'
        shift = integerPart.length - 1;
        normalizedMantissa = (integerPart.substring(1) + fractionalPart); // Skip the leading '1'
    }

    // Ensure the mantissa is exactly 23 bits long
    normalizedMantissa = (normalizedMantissa + '0'.repeat(23)).substring(0, 23);

    return {
        mantissa: normalizedMantissa,
        exponent: shift
    };
}

// Format a binary and exponent into IEEE-754 binary representation
function formatIEEE754(sign, exponent, mantissa) {
    let exponentBinary = exponent.toString(2).padStart(8, '0');
    return sign + exponentBinary + mantissa;
}

// Convert a binary string to hexadecimal
function binaryToHex(binary) {
    let hex = parseInt(binary.replace(/\s+/g, ''), 2).toString(16).toUpperCase();
    return hex.padStart(8, '0');
}

// Clear input fields and output display
function clearFields() {
    document.getElementById("number").value = '';
    document.getElementById("exponent").value = '';
    document.getElementById("binaryOutput").textContent = '';
    document.getElementById("hexOutput").textContent = '';
}

// Download binary and hexadecimal output as a text file
function downloadOutput() {
    let binaryOutput = document.getElementById('binaryOutput').textContent;
    let hexOutput = document.getElementById('hexOutput').textContent;
    let content = `Binary Output: ${binaryOutput}\nHexadecimal: ${hexOutput}`;
    console.log(content); // This will help you verify the output content.

    let blob = new Blob([content], { type: 'text/plain' });
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    a.href = url;
    a.download = 'FloatingPointConversionOutput.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}
