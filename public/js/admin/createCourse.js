$(document).ready(function () {
    const titleInput = $("#title");
    const slugInput = $("#slug");

    titleInput.on("blur", (event) => {
        const titleInputValue = $(event.target).val();

        const slugValue = createSlug(titleInputValue);

        slugInput.val(slugValue);

        slugExistence(slugValue);
    });

    slugInput.on("input", (event) => {
        const titleInputValue = $(event.target).val();

        const slugValue = createSlug(titleInputValue);

        slugExistence(slugValue);
    });

    function createSlug(string) {
        return string.replace(/([^۰-۹آ-یa-zA-Z0-9]|-)+/g, "-");
    }

    function slugExistence(slug) {
        $.ajax({
            type: "POST",
            url: "/admin/panel/courses/slug/existence",
            data: {slug},
            success: () => {
                slugInput.css('border', '1px solid green');
            },
            error: (err) => {
                slugInput.css('border', '2px solid red');
            },
        });
    }
});