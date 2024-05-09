// TODO: make background is darked when add windows open

let doc = document;
let current_add_window = false; // true - occupied, false - free

(function () {
    window.addEventListener('load', init); // everything was loaded
} ());

function init() {
    // events for opening and closing add windows
    doc.querySelector("#settings img").addEventListener("click", function() {
        smooth_move(doc.getElementById("settings"), "left", -420 - 70 - 10 - 10);  // 420px - width of add window, 70px - width of img, 10px - left shift, 10px - depth
    });
    doc.getElementById("btn-settings").addEventListener("click", function () {
        smooth_move(doc.getElementById("settings"), "left", 0);
    });
    doc.querySelector("#stats img").addEventListener("click", function() {
        smooth_move(doc.getElementById("stats"), "left", -420 - 70 - 10 - 10);  // 420px - width of add window, 70px - width of img, 10px - left shift, 10px - depth
    });
    doc.getElementById("btn-stats").addEventListener("click", function () {
        smooth_move(doc.getElementById("stats"), "left", 0);
    });
    doc.querySelector("#rules img").addEventListener("click", function() {
        smooth_move(doc.getElementById("rules"), "top", 180 - (180 + 600));  // 180px - top, 180px + 600px - just depth (we mustn`t see rules when we don`t press the button)
    });
    doc.getElementById("btn-rules").addEventListener("click", function () {
        smooth_move(doc.getElementById("rules"), "top", 180);
    });
}

function smooth_move(elem, direction, offset) {
    // smooth appearing and disappearing add windows
    let overlay = doc.getElementById("overlay");
    let addCss = `
        ${direction}: ${offset}px;
    `
    if (offset >= 0) { // want to occupied
        if (!current_add_window) { // free
            overlay.removeEventListener("transitionend", function () {
                overlay.style.zIndex = "-1";
            });
            elem.style.cssText = addCss;
            overlay.style.opacity = "90%";
            overlay.style.zIndex = 1;
            current_add_window = true; // occupied
        }
    }
    else { // want to leave
        overlay.addEventListener("transitionend", function () {
            overlay.style.display = "-1";
        });
        elem.style.cssText = addCss;
        overlay.style.opacity = "0%";
        current_add_window = false; // free
    }
}