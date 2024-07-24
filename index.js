function convert() {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    const text = input.value.trim();

    if (!text) {
        output.textContent = "Please enter a value.";
        return;
    }

    const pattern = /^([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)x(\d+)\^([-+]?\d+)$/;
    const match = text.match(pattern);

    if (!match) {
        output.textContent = "Input is formatted incorrectly. Use the format: <mantissa>x<base>^<exponent>";
        return;
    }

    const [_, mantissa, base, exponent] = match;
    const decimalMantissa = parseFloat(mantissa);
    const numExponent = parseInt(exponent, 10);

    const ieee754Binary = decimalToIEEE754(decimalMantissa, numExponent);
    const hexOutput = binaryToHex(ieee754Binary);

    output.innerHTML = `<strong>Binary:</strong> ${ieee754Binary} <br><strong>Hexadecimal:</strong> ${hexOutput}`;
}

function decimalToIEEE754(decimal, exponentInput) {
    const sign = decimal < 0 ? 1 : 0;
    decimal = Math.abs(decimal);

    let bias = 127;
    let leadingOneIndex = 0;
    let binary = decimalToBinary(decimal);
    let [integerPart, fractionalPart = ""] = binary.split('.');

    if (integerPart !== "0") {
        leadingOneIndex = integerPart.length - 1;
        fractionalPart = integerPart.substr(1) + fractionalPart;
    } else {
        leadingOneIndex = -fractionalPart.indexOf('1') - 1;
        fractionalPart = fractionalPart.substr(-leadingOneIndex);
    }

    let exponent = leadingOneIndex + bias + exponentInput;
    let mantissa = fractionalPart.padEnd(23, '0').slice(0, 23);

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
