// Patch JSON.parse early to prevent "undefined implies invalid JSON" crashes
const originalParse = JSON.parse;

// @ts-ignore
JSON.parse = function (text, reviver) {
  if (arguments.length === 0 || text === undefined) {
    return undefined;
  }
  if (text === null) {
    return null;
  }
  
  const textStr = String(text);
  const trimmed = textStr.trim();
  
  if (trimmed === '' || trimmed === 'undefined' || trimmed === '"undefined"') {
    return undefined;
  }
  
  try {
    return originalParse(text, reviver);
  } catch (err) {
    if (err instanceof SyntaxError) {
      console.warn("Patched JSON.parse absorbed SyntaxError:", err.message, "Input text:", textStr.slice(0, 100));
      return undefined;
    }
    throw err;
  }
};
