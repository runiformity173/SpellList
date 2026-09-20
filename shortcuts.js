window.addEventListener("keydown",function (e) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const isModifierPressed = isMac ? event.metaKey : event.ctrlKey;
    if (e.key == "ArrowLeft" || e.key == "ArrowUp") {
        let navigateMethod = navigatePrevious;
        if (isModifierPressed) navigateMethod = navigateFirst;
        if (navigateMethod()) e.preventDefault();
    } else if (e.key == "ArrowRight" || e.key == "ArrowDown") {
        let navigateMethod = navigateNext;
        if (isModifierPressed) navigateMethod = navigateLast;
        if (navigateMethod()) e.preventDefault();
    }
})
function navigatePrevious() {
    const el = document.querySelector(".selected-spell-item");
    let prev = el?.previousElementSibling;
    while (prev && prev.style.display == "none") {
        prev = prev.previousElementSibling;
    }
    if (prev) {
        prev.click();
        return true;
    }
}
function navigateNext() {
    const el = document.querySelector(".selected-spell-item");
    let next = el?.nextElementSibling;
    while (next && next.style.display == "none") {
        next = next.nextElementSibling;
    }
    if (next) {
        next.click();
        return true;
    }
}
function navigateFirst() {
    let el = document.querySelector(".selected-spell-item")?.parentElement?.firstElementChild;
    while (el && el.style.display == "none") {
        el = el.nextElementSibling;
    }
    if (el) {
        el.click();
        return true;
    }
}
function navigateLast() {
    let el = document.querySelector(".selected-spell-item")?.parentElement?.lastElementChild;
    while (el && el.style.display == "none") {
        el = el.previousElementSibling;
    }
    if (el) {
        el.click();
        return true;
    }
}