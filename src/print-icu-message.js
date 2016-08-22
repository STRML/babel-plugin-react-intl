/*
 * Copyright 2015, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import {parse} from 'intl-messageformat-parser';

const ESCAPED_CHARS = {
    '\\' : '\\\\',
    '\\#': '\\#',
    '{'  : '\\{',
    '}'  : '\\}',
};

const ESCAPE_CHARS_REGEXP = /\\#|[{}\\]/g;

export default function (message) {
    const ast = parse(message);
    return printICUMessage(ast);
}

function printICUMessage(ast) {
    const printedNodes = ast.elements.map((node) => {
        if (node.type === 'messageTextElement') {
            return printMessageTextASTNode(node);
        }

        if (!node.format) {
            return `{${node.id}}`;
        }

        switch (getArgumentType(node.format)) {
        case 'number':
        case 'date':
        case 'time':
            return printSimpleFormatASTNode(node);

        case 'plural':
        case 'selectordinal':
        case 'select':
            return printOptionalFormatASTNode(node);
        }
    });

    return printedNodes.join('');
}

function getArgumentType({type, ordinal}) {
    // Special-case ordinal plurals to use `selectordinal` instead of `plural`.
    if (type === 'pluralFormat' && ordinal) {
        return 'selectordinal';
    }

    return type.replace(/Format$/, '').toLowerCase();
}

function printMessageTextASTNode({value}) {
    return value.replace(ESCAPE_CHARS_REGEXP, (char) => ESCAPED_CHARS[char]);
}

function printSimpleFormatASTNode({id, format}) {
    const argumentType = getArgumentType(format);
    const style = format.style ? `, ${format.style}` : '';

    return `{${id}, ${argumentType}${style}}`;
}

function printOptionalFormatASTNode({id, format}) {
    const argumentType = getArgumentType(format);
    const offset = format.offset ? `, offset:${format.offset}` : '';

    const options = format.options.map((option) => {
        const optionValue = printICUMessage(option.value);
        return ` ${option.selector} {${optionValue}}`;
    });

    return `{${id}, ${argumentType}${offset},${options.join('')}}`;
}
