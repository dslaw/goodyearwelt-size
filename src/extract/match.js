const matchRegex = function(line, pattern) {
  const ret = pattern.exec(line);
  if (!ret) {
    // Return empty object instead of null for
    // destructuring.
    return {};
  }

  const [ match, ...captures ] = ret;
  const { index } = ret;
  return { match, captures, index };
};

const matchSize = function(line) {
  // TODO: Will match a whole size if first decimal is not a
  //       half size, i.e. 8.2 => 8.
  //       If someone meant a half size, but made a typo, the
  //       whole size will be returned!
  const pattern = /[0-9]{1,2}(\.[05])?/;
  return matchRegex(line, pattern);
};

const matchWidth = function(line) {
  // The pattern /E(?!U)/ stops the regex from matching
  // the 'E' in 'EU' when no width is specified. But if
  // there is no space between an 'E' width and an intl
  // of 'UK/US', the width will not be matched. The latter
  // case can be matched via /E(?=U)/, but then the former
  // will be broken. We opt to handle the former as it is
  // significantly more common.
  const pattern = /^\s?((EEE)|(EE)|(E(?!U))|[ABCDFG])/i;
  return matchRegex(line, pattern);
};

const matchIntl = function(line) {
  const pattern = /^\s?(US|UK|EU)/i;
  return matchRegex(line, pattern);
};

const matchIntlPreceding = function(line) {
  const pattern = /(US|UK|(EU)R?)(?=\s?[0-9])/i;
  return matchRegex(line, pattern);
};

const collapseSpaces = function(string) {
  return string.replace(/\s+/g, ' ');
};

const stickyMatch = function(line, fns, nChars) {
  // Ensure output is always uppercase. Spacing won't be returned.
  const inputString = collapseSpaces(line).toUpperCase();
  const matches = [];
  let startPos = 0
    endPos = inputString.length;

  for (const fn of fns) {
    const string = inputString.slice(startPos, endPos);
    let { match, captures, index } = fn(string);
    if (match) {
      // Constrain the search space after the number is found,
      // as the pattern for `width` may generate a lot of false
      // positives, otherwise (i.e. if notes are present and not
      // international convention).
      startPos += index + match.length;
      endPos = startPos + nChars;
      match = match.trim();
    }
    matches.push(match || null);
  }

  return matches;
};

const postMatch = function(line) {
  const fns = [ matchSize, matchWidth, matchIntl ];
  const maxCharsAhead = 4;  // Space + three chars for 'EEE'.
  const matches = stickyMatch(line, fns, maxCharsAhead);
  return {
    size: matches[0],
    width: matches[1],
    intl: matches[2],
  };
};

const precedesMatch = function(line) {
  const fns = [ matchIntlPreceding, matchSize, matchWidth ];
  const maxCharsAhead = 6; // Space, R (from EUR) and four chars for e.g. 11.5.
  const matches = stickyMatch(line, fns, maxCharsAhead);
  return {
    size: matches[1],
    width: matches[2],
    intl: matches[0] === 'EUR' ? 'EU' : matches[0],
  };
};


module.exports = {
  postMatch,
  precedesMatch,
};
