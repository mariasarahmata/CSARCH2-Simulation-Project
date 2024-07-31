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
        const expInput = parseInt(exponentInput.value.trim());
        clearOutputs();

        if (!numInput || isNaN(expInput)) {
            errorOutput.innerText = 'ERROR: Null or invalid input';
            return;
        }

        const result = convertFloatingPointNumber(numInput, expInput);
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
        const signBit = numInput[0] === '-' ? '1' : '0';
        let binary = getBinaryFraction(numInput.replace(/^-/, ''));
        let exponentBits = 127 + exponent;

        if (exponentBits <= 0) { // Denormalized number handling
            binary = '0' + binary; // Include implicit leading zero
            binary = shiftRight(binary, -exponentBits + 1); // Shift to fit into denormalized format
            return buildIEEE754Output(signBit, '00000000', binary);
        }

        return { // For simplicity, only showing denormalized handling here
            binary: 'Handling for normal and other special values not shown',
            hex: 'Only denormalized handling is adjusted'
        };
    }

    function getBinaryFraction(decimal) {
        let [integerPart, fractionalPart = ''] = decimal.split('.');
        return integerPart + fractionalPart;
    }

    function shiftRight(binary, shifts) {
        while (shifts > 0 && binary.length > 0) {
            binary = binary.substring(1);
            shifts--;
        }
        return binary.padEnd(23, '0'); // Pad the binary to ensure it is 23 bits long
    }

    function buildIEEE754Output(signBit, exponentBits, mantissa) {
        mantissa = mantissa.substring(0, 23); // Ensure mantissa is no longer than 23 bits
        const binary = `${signBit} ${exponentBits} ${mantissa}`;
        const hex = binaryToHex(binary.replace(/ /g, ''));
        return { binary, hex };
    }

    function binaryToHex(binaryStr) {
        const binLength = binaryStr.length;
        let hex = '';
        for (let i = 0; i < binLength; i += 4) {
            const chunk = binaryStr.substring(i, i + 4);
            hex += parseInt(chunk, 2).toString(16);
        }
        return hex.padStart(8, '0').toUpperCase();
    }

    function setOutput(binary, hex) {
        binaryOutput.textContent = binary;
        hexOutput.textContent = hex;
    }
});
