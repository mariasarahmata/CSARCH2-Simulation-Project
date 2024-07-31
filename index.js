document.addEventListener('DOMContentLoaded', () => {
  const numberInput = document.getElementById('number');
  const baseSelect = document.getElementById('base');
  const exponentInput = document.getElementById('exponent');
  const binaryOutput = document.getElementById('binaryOutput');
  const hexOutput = document.getElementById('hexOutput');
  const errorOutput = document.getElementById('error');

  document.getElementById('convert-button').addEventListener('click', handleConversion);
  document.getElementById('clear-button').addEventListener('click', handleClear);
  document.getElementById('download-button').addEventListener('click', handleDownload);

  function handleConversion() {
    const numInput = numberInput.value.trim();
    const expInput = exponentInput.value.trim();
    const base = baseSelect.value;
    clearOutputs();

    if (handleSpecialCases(numInput)) {
      return;
    }

    convertNumber(numInput, base, expInput);
  }

  function handleClear() {
    numberInput.value = '';
    baseSelect.value = '2';
    exponentInput.value = '';
    clearOutputs();
  }

  function handleDownload() {
    const numInput = numberInput.value.trim();
    const expInput = exponentInput.value.trim();
    const base = baseSelect.value;
    saveToFile(numInput, base, expInput);
  }

  function clearOutputs() {
    binaryOutput.innerText = '';
    hexOutput.innerText = '';
    if (errorOutput) errorOutput.innerText = '';
  }

  function handleSpecialCases(numInput) {
    if (numInput.toLowerCase() === 'snan') {
      const result = handleNaN(true);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput.toLowerCase() === 'qnan') {
      const result = handleNaN(false);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput.toLowerCase() === 'infinity') {
      const result = handleInfinity(false);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput.toLowerCase() === '-infinity') {
      const result = handleInfinity(true);
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput === '-0') {
      const result = handleNegativeZero();
      setOutput(result.binary, result.hex);
      return true;
    }

    if (numInput === '0') {
      const result = handlePositiveZero();
      setOutput(result.binary, result.hex);
      return true;
    }

    return false;
  }

  function convertNumber(numInput, base, expInput) {
    if (base === '10') {
      numInput = parseFloat(numInput).toString(2);
    }

    normalizeAndConvert(numInput, expInput);
  }

  function normalizeAndConvert(binary, exponent) {
    let exp = parseInt(exponent);
    let signBit = binary.startsWith('-') ? '1' : '0';
    binary = binary.replace('-', '').replace('.', '');
    let firstOneIndex = binary.indexOf('1');
    let normalizedBinary = binary.slice(firstOneIndex + 1);
    exp += binary.length - firstOneIndex - 1;

    // Compute exponent and handle normalization
    exp = exp + 127; // Adjust for bias
    let exponentBinary = exp.toString(2).padStart(8, '0');

    // Extract mantissa
    let mantissa = normalizedBinary.padEnd(23, '0').substring(0, 23);

    let binaryResult = signBit + ' ' + exponentBinary + ' ' + mantissa;
    let hexResult = binaryToHex(signBit + exponentBinary + mantissa);

    setOutput(binaryResult, hexResult);
  }

  function binaryToHex(binary) {
    let result = '';
    for (let i = 0; i < binary.length; i += 4) {
      let part = binary.substring(i, i + 4);
      result += parseInt(part, 2).toString(16);
    }
    return result.toUpperCase();
  }

  function setOutput(binary, hex) {
    binaryOutput.innerText = binary;
    hexOutput.innerText = hex;
  }

  function handleNaN(isSignaling) {
    let binary = '01111111111111111111111111111111'; // Default pattern for NaN
    let hex = '7FFFFFFF';
    if (isSignaling) {
      binary = '01111111101111111111111111111111'; // Example of sNaN
      hex = '7FBFFFFF';
    }
    return { binary, hex };
  }

  function handleInfinity(isNegative) {
    let binary = isNegative ? '11111111100000000000000000000000' : '01111111100000000000000000000000';
    let hex = isNegative ? 'FF800000' : '7F800000';
    return { binary, hex };
  }

  function handleNegativeZero() {
    let binary = '10000000000000000000000000000000';
    let hex = '80000000';
    return { binary, hex };
  }

  function handlePositiveZero() {
    let binary = '00000000000000000000000000000000';
    let hex = '00000000';
    return { binary, hex };
  }

  function saveToFile(numInput, base, expInput) {
    const binaryOut = binaryOutput.innerText;
    const hexOut = hexOutput.innerText;
    if (binaryOut !== '' && hexOut !== '') {
      const data = `INPUT\nNumber: ${numInput}\nBase: ${base}\nExponent: ${expInput}\n\nOUTPUT\nBinary Number: ${binaryOut}\nHexadecimal Number: ${hexOut}\n`;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Binary32_Converter.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      errorOutput.innerText = "ERROR: Can't save to file, output is empty. Please convert first.";
    }
  }
});
