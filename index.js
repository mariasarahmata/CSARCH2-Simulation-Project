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
        let binary = numInput.replace(/^-/, '').replace(/[\+x]/g, '').split('.')[1]; // Extract only the fractional part after the decimal
        let adjustedExponent = 127 + exponent; // Apply IEEE 754 bias

        // Handling for denormalized numbers
        if (adjustedExponent <= 0) {
            binary = binary.padStart(binary.length - adjustedExponent + 1, '0'); // Shift the binary digits right
            if (binary.length > 23) {
                binary = binary.substring(0, 23); // Trim the binary to fit 23 bits if necessary
            }
            return {
                binary: `${signBit} 00000000 ${binary.padEnd(23, '0')}`,
                hex: `${signBit}0${parseInt(binary, 2).toString(16).padStart(7, '0').toUpperCase()}`
            };
        }

        // Handling for infinity and normal numbers omitted for brevity
    }

    function setOutput(binary, hex) {
        binaryOutput.textContent = binary;
        hexOutput.textContent = hex;
    }
});
