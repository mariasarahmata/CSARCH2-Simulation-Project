document.addEventListener('DOMContentLoaded', () => {
    const numberInput = document.getElementById('number');
    const exponentInput = document.getElementById('exponent');
    const binaryOutput = document.getElementById('binaryOutput');
    const hexOutput = document.getElementById('hexOutput');
    const errorOutput = document.getElementById('error');

    document.getElementById('convert-button').addEventListener('click', handleConversion);
    document.getElementById('clear-button').addEventListener('click', handleClear);

    function handleConversion() {
        const numInput = numberInput.value.trim();
        const expInput = exponentInput.value.trim();
        clearOutputs();

        if (!numInput || expInput === '') {
            errorOutput.innerText = 'ERROR: Null or invalid input';
            return;
        }

        const expInteger = parseInt(expInput);
        const result = convertFloatingPointNumber(numInput, expInteger);
        setOutput(result.binary, result.hex);
    }

    function handleClear() {
        numberInput.value = '';
        exponentInput.value = '';
        clearOutputs();
    }

    function clearOutputs() {
        binaryOutput.innerText = '';
        hexOutput.innerText = '';
        errorOutput.innerText = '';
    }

    function convertFloatingPointNumber(numInput, exponent) {
        const signBit = numInput.startsWith('-') ? '1' : '0';
        numInput = numInput.replace(/^-/, ''); // Remove the sign for easier processing
        let normalized = true;

        // Calculate the adjusted exponent based on the input exponent
        let adjustedExponent = 127 + exponent; // Apply the IEEE 754 bias

        // Handling for special cases based on the exponent range
        if (adjustedExponent <= 0) { // Denormalized number or underflow
            normalized = false;
            adjustedExponent = 0;
        } else if (adjustedExponent >= 255) { // Overflow or infinity
            return {
                binary: `${signBit} 11111111 00000000000000000000000`,
                hex: signBit === '1' ? 'FF800000' : '7F800000'
            };
        }

        // Extracting mantissa from the input number
        let [integerPart, fractionalPart = ''] = numInput.split('.');
        let binaryInteger = parseInt(integerPart).toString(2);
        let binaryFraction = fractionalize(fractionalPart);

        // Combine and normalize the binary number
        let fullBinary = binaryInteger + binaryFraction;
        let leadingOneIndex = fullBinary.indexOf('1');

        // If normalized, adjust binary by shifting to get the mantissa
        if (normalized && leadingOneIndex !== -1) {
            fullBinary = fullBinary.slice(leadingOneIndex + 1); // Remove the leading one and adjust the exponent
        }

        let mantissa = fullBinary.slice(0, 23).padEnd(23, '0'); // Pad the mantissa if it's shorter than 23 bits

        return {
            binary: `${signBit} ${adjustedExponent.toString(2).padStart(8, '0')} ${mantissa}`,
            hex: binaryToHex(`${signBit}${adjustedExponent.toString(2).padStart(8, '0')}${mantissa}`)
        };
    }

    function fractionalize(fractionalPart) {
        let binaryFraction = '';
        let fraction = '0.' + fractionalPart;
        let fractionValue = parseFloat(fraction);

        while (fractionValue > 0 && binaryFraction.length < 23) {
            fractionValue *= 2;
            if (fractionValue >= 1) {
                binaryFraction += '1';
                fractionValue -= 1;
            } else {
                binaryFraction += '0';
            }
        }

        return binaryFraction;
    }

    function binaryToHex(binary) {
        let hex = '';
        for (let i = 0; i < binary.length; i += 4) {
            hex += parseInt(binary.substr(i, 4), 2).toString(16);
        }
        return hex.toUpperCase().padStart(8, '0');
    }

    function setOutput(binary, hex) {
        binaryOutput.textContent = binary;
        hexOutput.textContent = hex;
    }
});
