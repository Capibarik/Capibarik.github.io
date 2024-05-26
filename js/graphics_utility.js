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
export function send_alert(message) {
    // like alert, but it is better
    let div_alert = doc.createElement("div");
    div_alert.classList.add("alert");
    let div_attention = doc.createElement("div");
    div_attention.classList.add("attention");
    let img = doc.createElement("img");
    img.src = "imgs/attention.svg";
    img.alt = "Внимание";
    let div_message = doc.createElement("div");
    div_message.classList.add("message");
    div_message.innerHTML = message;
    let div_alert_close = doc.createElement("div");
    div_alert_close.classList.add("alert-close");
    div_alert_close.innerHTML = "X";
    div_attention.appendChild(img);
    div_alert.appendChild(div_attention);
    div_alert.appendChild(div_message);
    div_alert.appendChild(div_alert_close);
    div_alert_close.addEventListener("click", function () {
        remove_alert(div_alert);
    });
    doc.getElementsByTagName("body")[0].appendChild(div_alert);
    // situate alert on the screen
    let width = div_alert.getBoundingClientRect().width;
    let left_offset = window.innerWidth / 2 - width / 2;
    div_alert.style.left = `${left_offset}px`;
    div_alert.style.top = "20%";
    div_alert.style.opacity = "100%";
    setTimeout(function () {
        remove_alert(div_alert);
    }, 3000);
}

function remove_alert(div_alert) {
    // div_alert - our alert that will be removed
    // disappearing
    div_alert.style.opacity = "0%";
    div_alert.addEventListener("transitionend", function () {
        // destruct after disappearing
        div_alert.remove();
    }, {once: true,});
}

export function read_radio_data(group_of_radio) {
    // read condition of radio buttons
    for (let radio_button of group_of_radio) {
        if (radio_button.checked) {
            return radio_button.getAttribute("value");
        }
    }
}

export function remove_elems(query) {
    let elem = doc.querySelector(query);
    while (elem !== null) {
        elem.remove();
        elem = doc.querySelector(query);
    }
}

export function set_list_of_elems_attr(list_of_elems, property, value) {
    for (let elem of list_of_elems) {
        elem.setAttribute(property, value);
    }
}

export function normalize_part_field_coords(part_field, direction) {
    /*
    Real:
    1 2 3  (cw (ccw))   7 4 1
    4 5 6     -->       8 5 2  
    7 8 9               9 6 3
    
    We should fix that with turning the opposite direction

    Fixed:
    7 4 1  (ccw (cw))  1 2 3
    8 5 2     -->      4 5 6
    9 6 3              7 8 9

    We know that there is the normal order in part_field of notches in HTML
    So we should change sequence of notches "1 2 3 4 5 6 7 8 9" to "3 6 9 2 5 8 1 4 7"
    if a player turns field clockwise
    And "1 2 3 4 5 6 7 8 9" to "7 4 1 8 5 2 9 6 3", if a player turns counterclockwise, 
    to make normal order on the screen
    */
    let part_field_children = part_field.children;
    let mas = [];
    let nmas = [];
    // read order of notches
    for (let i = 0; i < 9; i++) {
        mas[i] = parseInt(part_field_children[i].classList[1].match(/\d/));
        nmas[i] = mas[i];
    }
    let k = (direction == "cw" ? 9 - 1 : 0);
    let d = (direction == "cw" ? -1 : +1);
    for (let i = 0; i < 3; i++) {
        for (let j = 2 - i; j < mas.length - i; j += 3) {
            nmas[j] = mas[k];
            k += d;
        }
    }
    for (let i = 0; i < mas.length; i++) {
        part_field_children[i].classList.remove("n" + mas[i]);
        part_field_children[i].classList.add("n" + nmas[i]);
    }
}

export function set_number_of_marbles(color, number) {
    // on the screen
    let td_xnum = doc.getElementById(color + "-xnum");
    td_xnum.innerHTML = "X" + number;
}

export function random_number(down, up) {
    // r ∈ [down, up)
    return Math.floor(Math.random() * (up - down) + down);
}