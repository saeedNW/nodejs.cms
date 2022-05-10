/** import expect method from chai module */
const {expect} = require("chai");

/** import escape and trim tool */
const {escapeAndTrim} = require("../../utils/scapeAndTrim");

let req = {
    body: {
        trim: " trim the text ",
        escape: "<script>alert(500)</script>"
    }
}


describe("user input trim test", () => {
    it("trim user input", () => {
        escapeAndTrim(req, ['trim']);

        const trimmedText = req.body.trim;

        expect(trimmedText).to.equal("trim the text");
    });
});

describe("user input escape test", () => {
    it('escape user input ', () => {
        escapeAndTrim(req, ["escape"]);

        const escapedText = req.body.escape;

        expect(escapedText).to.equal("&lt;script&gt;alert(500)&lt;&#x2F;script&gt;");
    });
});