function convertNumber() {
    const number = parseFloat(document.getElementById('numberInput').value);
    const base = document.getElementById('baseSelector').value;
    const exponentInput = parseInt(document.getElementById('exponentInput').value);

    let ieee754Binary = "";
    let hexOutput = "";
    let typeOutput = "Finite";

    if (isNaN(number)) {
        ieee754Binary = "00000000 00000000 00000000 00000000"; // Representation for NaN in IEEE-754
        hexOutput = "00000000";
        typeOutput = "NaN";
    } else if (number === Infinity || number === -Infinity) {
        ieee754Binary = (number < 0 ? "1" : "0") + "11111111 00000000 00000000 00000000"; // Representation for Infinity
        hexOutput = (number < 0 ? "FF" : "7F") + "800000";
        typeOutput = "Infinity";
    } else {
        const result = decimalToIEEE754(number, base, exponentInput);
        ieee754Binary = result.binary;
        hexOutput = binaryToHex(ieee754Binary);
    }

    document.getElementById('binaryOutput').innerText = ieee754Binary;
    document.getElementById('hexOutput').innerText = hexOutput;
    document.getElementById('typeOutput').innerText = typeOutput;
}

function decimalToIEEE754(number, base, exponentInput) {
    const sign = number < 0 ? "1" : "0";
    number = Math.abs(number);

    // Convert to binary based on the base
    let binary = base === "10" ? decimalToBinary(number) : number.toString(2);
    let [integerPart, fractionalPart = ""] = binary.split('.');

    // Normalize the binary number
    let exponent = 0;
    if (integerPart !== "0") {
        exponent = integerPart.length - 1;
        fractionalPart = integerPart.slice(1) + fractionalPart;
    } else {
        const firstOneIndex = fractionalPart.indexOf("1");
        if (firstOneIndex !== -1) {
            exponent = -(firstOneIndex + 1);
            fractionalPart = fractionalPart.slice(firstOneIndex + 1);
        }
    }

    exponent += 127 + (exponentInput || 0); // Adjust the exponent for IEEE-754 bias
    let mantissa = fractionalPart.padEnd(23, '0').slice(0, 23);

    const binaryExponent = exponent.toString(2).padStart(8, '0');
    return {
        binary: `${sign} ${binaryExponent} ${mantissa}`
    };
}

function binaryToHex(binary) {
    binary = binary.replace(/\s+/g, ''); // Remove spaces
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
    let binary = integerPart.toString(2) + '.';
    let counter = 0;

    while (fractionalPart !== 0 && counter < 32) {
        fractionalPart *= 2;
        let bit = Math.floor(fractionalPart);
        binary += bit;
        fractionalPart -= bit;
        counter++;
    }

    return binary;
}
