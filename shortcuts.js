window.addEventListener("keydown",function (e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;
    if (e.key == "ArrowLeft") {
        let navigateMethod = navigatePrevious;
        if (isModifierPressed) navigateMethod = navigateFirst;
        if (navigateMethod()) e.preventDefault();
    } else if (e.key == "ArrowRight") {
        let navigateMethod = navigateNext;
        if (isModifierPressed) navigateMethod = navigateLast;
        if (navigateMethod()) e.preventDefault();
    }
})
function navigatePrevious() {
    const el = document.querySelector(".selected-spell-item");
    if (el?.previousElementSibling) {
        el.previousElementSibling.click();
        return true;
    }
}
function navigateNext() {
    const el = document.querySelector(".selected-spell-item");
    if (el?.nextElementSibling) {
        el.nextElementSibling.click();
        return true;
    }
}
function navigateFirst() {
    const el = document.querySelector(".selected-spell-item")?.parentElement?.firstElementChild;
    if (el && el != document.querySelector(".selected-spell-item")) {
        el.click();
        return true;
    }
}
function navigateLast() {
    const el = document.querySelector(".selected-spell-item")?.parentElement?.lastElementChild;
    if (el && el != document.querySelector(".selected-spell-item")) {
        el.click();
        return true;
    }
}