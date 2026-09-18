window.addEventListener("keydown",function (e) {
    if (e.key == "ArrowLeft") {
        if (navigatePrevious()) e.preventDefault();
    } else if (e.key == "ArrowRight") {
        if (navigateNext()) e.preventDefault();
    }
})
function navigatePrevious() {
    if (window.location.hash.length < 2) return;
    const current = getSpellByName(window.location.hash.slice(1));
    const el = document.getElementById(current.name + " " + current.source);
    if (el?.previousElementSibling) {
        el.previousElementSibling.click();
        return true;
    }
}
function navigateNext() {
    if (window.location.hash.length < 2) return;
    const current = getSpellByName(decodeURIComponent(window.location.hash.slice(1)));
    const el = document.getElementById(current.name + " " + current.source);
    if (el?.nextElementSibling) {
        el.nextElementSibling.click();
        return true;
    }
}