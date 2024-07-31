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
    switch (numInput.toLowerCase()) {
      case '+0':
      case '0':
        setOutput('0 00000000 00000000000000000000000', '00000000');
        return true;
      case '-0':
        setOutput('1 00000000 00000000000000000000000', '80000000');
        return true;
      case '+infinity':
      case 'infinity':
        setOutput('0 11111111 00000000000000000000000', '7F800000');
        return true;
      case '-infinity':
        setOutput('1 11111111 00000000000000000000000', 'FF800000');
        return true;
      case 'snan':
        setOutput('0 11111111 01111111111111111111111', '7FBFFFFF');
        return true;
      case 'qnan':
        setOutput('0 11111111 11111111111111111111111', '7FFFFFFF');
        return true;
      case 'largest_positive_normal':
        setOutput('0 11111110 11111111111111111111111', '7F7FFFFF');
        return true;
      case 'largest_negative_normal':
        setOutput('1 11111110 11111111111111111111111', 'FF7FFFFF');
        return true;
      default:
        return false;
    }
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
