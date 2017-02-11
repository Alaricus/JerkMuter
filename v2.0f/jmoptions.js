"use strict";

let quotes = document.getElementById("quotes");
let threads = document.getElementById("threads");
let rep = document.getElementById("rep");
let low = document.getElementById("low");
let phrases = document.getElementById("phrases");
let keywordText = document.getElementById("keywordtext");
let add = document.getElementById("add");
let disable = document.getElementById("disable");
let name = document.getElementById("name");
let borderColor = document.getElementById("bordercolor");
let backColor = document.getElementById("backcolor");
let textColor = document.getElementById("textcolor");
let noteText = document.getElementById("notetext");
let example = document.getElementById("example");
let save = document.getElementById("save");
let status = document.getElementById("status");
let jerkList = document.getElementById("jerklist");
let keywordList = document.getElementById("keywordlist");

let jerks = [];
let keywords = [];

function save_options() {
    let saveToStorage = browser.storage.local.set({
        st_quotes: quotes.checked,
        st_threads: threads.checked,
        st_rep: rep.checked,
        st_low: low.checked,
        st_phrases: phrases.checked,
        st_disable: disable.checked,
        st_name: name.checked,
        st_borderColor: borderColor.value.trim(),
        st_backColor: backColor.value.trim(),
        st_textColor: textColor.value.trim(),
        st_noteText: noteText.value.trim(),
        st_jerks: jerks,
        st_keywords: keywords
    });
    
    function informUser() {
        status.style.display = "block";
        status.textContent = "OPTIONS SAVED.";
        setTimeout(function() {
            status.style.display = "none";
            status.textContent = "";
        }, 1500);
    }

    saveToStorage.then(informUser, () => { console.log("Failed to save options.") });
}

function restore_options() {
    let restoreFromStorage = browser.storage.local.get();
    
    function restoreItems(items) {
        quotes.checked = items.st_quotes || true;
        threads.checked = items.st_threads || false;
        rep.checked = items.st_rep || true;
        low.checked = items.st_low || true;
        phrases.checked = items.st_phrases || false;
        disable.checked = items.st_disable || false;
        name.checked = items.st_name || false;
        borderColor.value = items.st_borderColor || "#ff8080";
        backColor.value = items.st_backColor || "#ffe6e6";
        textColor.value = items.st_textColor || "#ff8080";
        noteText.value = items.st_noteText || "Post Muted";

        example.style.borderColor = borderColor.value;
        example.style.backgroundColor = backColor.value;
        example.style.color = textColor.value;
        example.textContent = noteText.value;
        if (name.checked) {
            example.textContent += " (JerkName)";
        }

        jerks = items.st_jerks || ["JerkMcJerkyface"];
        populateJerkList();

        keywords = items.st_keywords || ["literally hitler", "politics"];
        populateKeywordList();
    }    

    restoreFromStorage.then(restoreItems, () => { console.log("Failed to restore options.") });
}

function populateJerkList() {
    if (jerks.length > 0) {
        while( jerkList.firstChild ){
            jerkList.removeChild( jerkList.firstChild );
        }
        jerks.forEach( (jerk) => {
            let entry = document.createElement("li");
            entry.appendChild(document.createTextNode(jerk));
            entry.innerHTML += " <a id='" + jerk + "'>[unmute]</a>";
            jerkList.appendChild(entry);
        });
    } else {
        document.getElementById("showjerks").style.display = "none";
    }
}

function populateKeywordList() {
    if (keywords.length > 0) {
        while( keywordList.firstChild ){
            keywordList.removeChild( keywordList.firstChild );
        }
        keywords.forEach( (keyword) => {
            let entry = document.createElement("li");
            entry.appendChild(document.createTextNode(keyword));
            entry.innerHTML += " <a id='" + keyword + "'>[unmute]</a>";
            keywordList.appendChild(entry);
        });
    } else {
        document.getElementById("showkeywords").style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", restore_options);

add.addEventListener("click", () => {
    if (keywordText.value !== "") {
        keywords.push(keywordText.value.trim());
        document.getElementById("showkeywords").style.display = "block";
        save_options();
        restore_options();
    }
});

save.addEventListener("click", save_options);

name.addEventListener("click", () => {
    example.textContent = noteText.value
    if (name.checked) {
        example.textContent += " (JerkName)";
    }
});

noteText.addEventListener("change", () => {
    example.textContent = noteText.value
    if (name.checked) {
        example.textContent += " (JerkName)";
    }
});

borderColor.addEventListener("change", () => {
    example.style.borderColor = borderColor.value;
});

backColor.addEventListener("change", () => {
    example.style.backgroundColor = backColor.value;
});

textColor.addEventListener("change", () => {
    example.style.color = textColor.value;
});

jerkList.addEventListener("click", (e) => {
    if( e.target && e.target.nodeName === "A") {
        let i = jerks.indexOf(e.target.id);
        jerks.splice(i, 1);
        save_options();
        restore_options();
    }
});

keywordList.addEventListener("click", (e) => {
    if( e.target && e.target.nodeName === "A") {
        let i = keywords.indexOf(e.target.id);
        keywords.splice(i, 1);
        save_options();
        restore_options();
    }
});
