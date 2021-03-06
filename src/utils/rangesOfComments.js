const NORMAL = 0;
const LINE_COMMENT = 1;
const BLOCK_COMMENT = 2;
const DQUOTE = 3;
const SQUOTE = 4;
const NEWLINE_CODE = 10;
const HASH_CODE = 35;
const DQUOTE_CODE = 34;
const SQUOTE_CODE = 39;
const SLASH_CODE = 92;

/**
 * @param {string} source
 * @returns {number[][]}
 */
export default function rangesOfComments(source) {
  var result = [];
  var index = 0;
  var lastLineStart = 0;
  var end = source.length;
  var state = 0;

  var rangeStart = 0;

  while (index < end) {
    var c = source.charCodeAt(index);

    switch (state) {
      case NORMAL:
        if (c === HASH_CODE) {
          rangeStart = index;
          if (source.slice(index, index + 4) === '###\n') {
            state = BLOCK_COMMENT;
            index += 3;
          } else {
            state = LINE_COMMENT;
          }
        } else if (c === DQUOTE_CODE) {
          state = DQUOTE;
        } else if (c === SQUOTE_CODE) {
          state = SQUOTE;
        }
        break;

      case LINE_COMMENT:
        if (c === NEWLINE_CODE) {
          result.push({
            start: rangeStart,
            end: index,
            type: 'line'
          });
          state = NORMAL;
        }
        break;

      case BLOCK_COMMENT:
        if (c === HASH_CODE) {
          if (source.slice(index, index + 4) === '###\n') {
            index += 3;
            state = NORMAL;
            result.push({
              start: rangeStart,
              end: index,
              type: 'block'
            });
          } else if (source.slice(index, index + 4) === '###' /* EOF */) {
            index += 3;
            state = NORMAL;
            result.push({
              start: rangeStart,
              end: index,
              type: 'block'
            });
          }
        }
        break;

      case DQUOTE:
        if (c === DQUOTE_CODE) {
          state = NORMAL;
        } else if (c === SLASH_CODE) {
          index++;
        }
        break;

      case SQUOTE:
        if (c === SQUOTE_CODE) {
          state = NORMAL;
        } else if (c === SLASH_CODE) {
          index++;
        }
        break;
    }

    if (source.charCodeAt(index) === NEWLINE_CODE) {
      lastLineStart = index + 1;
    }

    index++;
  }

  if (state === LINE_COMMENT || state === BLOCK_COMMENT) {
    result.push({
      start: rangeStart,
      end: index,
      type: state === LINE_COMMENT ? 'line' : 'block'
    });
  }

  return result;
}
