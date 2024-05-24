let doc = document;
let current_add_window = false; // true - occupied, false - free

export function smooth_move(elem, direction, offset) {
    // smooth appearing and disappearing add windows
    let overlay = doc.getElementById("overlay");
    let addCss = `
        ${direction}: ${offset}px;
    `
    if (offset >= 0) { // want to occupied
        if (!current_add_window) { // free
            elem.style.cssText = addCss;
            overlay.style.opacity = "90%";
            overlay.style.zIndex = "1";
            current_add_window = true; // occupied
        }
    }
    else { // want to leave
        elem.style.cssText = addCss;
        overlay.style.opacity = "0%";
        current_add_window = false; // free
    }
}