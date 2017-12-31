const MAX_CHARS_AHEAD = 4; // Space + three chars for `EEE`.


const match_regex = function(line, pattern) {
  let ret = pattern.exec(line);
  if (!ret) {
    // Return empty object instead of null for
    // destructuring.
    return {};
  }

  let [match, ...captures] = ret;
  let {index} = ret;
  return {match, captures, index};
};

const match_size = function(line) {
  // TODO: Will match a whole size if first decimal is not a
  //       half size, i.e. 8.2 => 8.
  //       If someone meant a half size, but made a typo, the
  //       whole size will be returned!
  let pattern = /[0-9]{1,2}(\.[05])?/;
  return match_regex(line, pattern);
};

const match_width = function(line) {
  // The pattern /E(?!U)/ stops the regex from matching
  // the 'E' in 'EU' when no width is specified. But if
  // there is no space between an 'E' width and an intl
  // of 'UK/US', the width will not be matched. The latter
  // case can be matched via /E(?=U)/, but then the former
  // will be broken. We opt to handle the former as it is
  // significantly more common.
  let pattern = /(\s+)?((EEE)|(EE)|(E(?!U))|[ABCDFG])/i;
  return match_regex(line, pattern);
};

const match_intl = function(line) {
  let pattern = /(\s+)?(US|UK|EU)/i;
  return match_regex(line, pattern);
};

const is_EU = function(size) {
  return size >= 39;
};

const sticky_match = function(line) {
  let fns = [match_size, match_width, match_intl];
  let matches = [];
  let input_string = line.toUpperCase(); // Output is always uppercase.
  let start_pos = 0
    end_pos = input_string.length;

  for (let fn of fns) {
    let string = input_string.slice(start_pos, end_pos);
    let {match, captures, index} = fn(string);
    if (match) {
      // Constrain the search space after the number is found,
      // as the pattern for `width` may generate a lot of false
      // positives, otherwise (i.e. if notes are present and not
      // international convention).
      start_pos += index + match.length;
      end_pos = start_pos + MAX_CHARS_AHEAD;
      match = match.trim();
    }
    matches.push(match || null);
  }

  return {
    size: matches[0],
    width: matches[1],
    intl: matches[2],
  };
};


module.exports = {
  is_EU: is_EU,
  sticky_match: sticky_match,
};
