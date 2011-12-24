var htmlProcessor = {
    sliceHTML: function (code) {
        var blocks = [],
            scriptMatcher = '<script .*type="(.*)".*>\n?((:?[\n\r]|.)*?)\\s*<\/script>',
            scriptRegExp = new RegExp(scriptMatcher, "g"),
            position = 0,
            lastInsertedPosition = 0,
            positionInRemaining,
            match, text, language;

        while ((positionInRemaining = code.substr(lastInsertedPosition).search(scriptRegExp)) !== -1) {
            position = lastInsertedPosition + positionInRemaining;
            match = new RegExp(scriptMatcher).exec(code.substr(position));
            language = match[1];
            text = match[2];
            position += code.substr(position).indexOf(text);

            blocks.push({
                language: "html",
                text: code.substr(lastInsertedPosition, position-lastInsertedPosition)
            });
            blocks.push({
                language: language,
                text: text
            });

            lastInsertedPosition = position + text.length;
        }
        blocks.push({
            language: "html",
            text: code.substr(lastInsertedPosition)
        });

        return blocks;
    },
    processBlock: function (block) {
        function processHTML (block, regexp) {
            var result = [],
                text = block.text,
                re = new RegExp(regexp, "g"),
                matches, match, pos, lastPos = 0,
                comment = "", code;

            if (matches = block.text.match(re)) {
                for (var i = 0; i < matches.length; i++) {
                    match = matches[i];
                    pos = text.indexOf(match);
                    code = text.substr(lastPos, pos-lastPos);
                    result.push([ comment, code ]);
                    comment = new RegExp(regexp).exec(match)[1];
                    text = text.replace(match, "");
                    lastPos = pos;
                }
                result.push([ comment, text.substr(lastPos)]);
            } else {
                result.push([ "", text, "red" ]);
            }
            return result;
        }

        switch (block.language) {
            case "html":
                return processHTML(block, '<\\!--\n?\\s*((:?[\n\r]|.)*?)\\s*\n?-->\n?');
                break;

            default:
                return processScript(block, '(:?\n\\s*)?\/\/.*');
                break;
        }
    }
};