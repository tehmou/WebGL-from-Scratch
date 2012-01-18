var htmlProcessor = {
    extractComments: function (code) {
        var result = [],
            blocks = htmlProcessor.sliceHTML(code);
        blocks.forEach(function (block) {
            result = result.concat(htmlProcessor.processComments(htmlProcessor.processBlock(block)));
        });
        return result;
    },
    sliceHTML: function (code) {
        var blocks = [],
            scriptMatcher = '<script .*type="(.*)".*>((:?[\n\r]|.)*?)[ \t]*<\/script>',
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
        function process (text, regexp) {
            var result = [],
                matches = text.match(new RegExp(regexp, "g")),
                lastPos = 0, comment = "";

            if (matches) {
                matches.forEach(function (match) {
                    var pos = text.indexOf(match),
                        code = text.substr(lastPos, pos-lastPos),
                        matchResult = new RegExp(regexp).exec(match),
                        comment;

                    for (var i = 1; i < matchResult.length; i++) {
                        if (matchResult[i]) {
                            comment = matchResult[i];
                            break;
                        }
                    }
                    result.push({ text: code, type: "code", language: block.language });
                    result.push({ text: comment, type: "comment", language: block.language, matchPos: i-1 });
                    text = text.replace(match, "");
                    lastPos = pos;
                });
            }
            result.push({ text: text.substr(lastPos), type: "code", language: block.language });
            return result;
        }

        switch (block.language) {
            case "html":
                return process(block.text, '<\\!--((:?[\n\r]|.)*?)-->');
                break;

            default:
                return process(block.text, '//(.*)|/\\*((?:[\n\r]|.)*?)\\*/');
                break;
        }
    },
    processComments: function (pieces) {
        var result = [],
            code, comment = "",
            matchPos,
            codeCleaner = /^\s*?\n|[ \t]*$/g,
            commentCleaner = /^\s*|\s*$/g,
            lineCommentCleaner = /^[ \*]*/gm,
            wholeStringIsWhiteSpace = /^\s*$/;

        pieces.forEach(function (piece) {
            if (piece.type === "code") {
                code = piece.text.replace(codeCleaner, "");
                if (code !== "") {
                    code = code.replace(wholeStringIsWhiteSpace, "");
                    comment = comment.replace(wholeStringIsWhiteSpace, "");
                    if (code !== "" || comment !== "") {
                        result.push({ text: code, comment: comment, language: piece.language, matchPos: matchPos });
                    }
                    code = comment = "";
                    matchPos = null;
                }
            } else if (piece.type === "comment") {
                matchPos = piece.matchPos;
                if (comment !== "") { comment += "\n"; }
                comment += piece.text.replace(lineCommentCleaner, "").replace(commentCleaner, "");
            } else {
                throw "Unknown type '" + piece.type + "'";
            }
        });
        if (comment !== "") {
            result.push({ text : "", comment: comment });
        }
        return result;
    }
};