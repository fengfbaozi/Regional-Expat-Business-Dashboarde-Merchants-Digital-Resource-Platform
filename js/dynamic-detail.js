(function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const target = id ? "dynamic.html#" + encodeURIComponent(id) : "dynamic.html";
    window.location.replace(target);
})();
