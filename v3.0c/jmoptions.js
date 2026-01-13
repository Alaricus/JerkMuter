"use strict";

const quotes = document.getElementById("quotes");
const threads = document.getElementById("threads");
const phrases = document.getElementById("phrases");
const keywordText = document.getElementById("keywordtext");
const add = document.getElementById("add");
const disable = document.getElementById("disable");
const name = document.getElementById("name");
const borderColor = document.getElementById("bordercolor");
const backColor = document.getElementById("backcolor");
const textColor = document.getElementById("textcolor");
const noteText = document.getElementById("notetext");
const example = document.getElementById("example");
const save = document.getElementById("save");
const status = document.getElementById("status");
const jerkList = document.getElementById("jerklist");
const keywordList = document.getElementById("keywordlist");

let jerks = [];
let keywords = [];

function save_options() {
  chrome.storage.sync?.set({
    st_quotes: quotes.checked,
    st_threads: threads.checked,
    st_phrases: phrases.checked,
    st_disable: disable.checked,
    st_name: name.checked,
    st_borderColor: borderColor.value.trim(),
    st_backColor: backColor.value.trim(),
    st_textColor: textColor.value.trim(),
    st_noteText: noteText.value.trim(),
    st_jerks: jerks,
    st_keywords: keywords
  }, () => {
    status.style.display = "block";
    status.textContent = "OPTIONS SAVED.";
    setTimeout(() => {
      status.style.display = "none";
      status.textContent = "";
    }, 1500);
  });
}

function restore_options() {
  chrome.storage.sync.get({
    st_quotes: true,
    st_threads: false,
    st_phrases: false,
    st_disable: false,
    st_name: false,
    st_borderColor: "#656565",
    st_backColor: "#656565",
    st_textColor: "#cccccc",
    st_noteText: "Muted",
    st_jerks: ["JerkMcJerkyface"],
    st_keywords: ["literally hitler"]
  }, (items) => {
    quotes.checked = items.st_quotes;
    threads.checked = items.st_threads;
    phrases.checked = items.st_phrases;
    disable.checked = items.st_disable;
    name.checked = items.st_name;
    borderColor.value = items.st_borderColor;
    backColor.value = items.st_backColor;
    textColor.value = items.st_textColor;
    noteText.value = items.st_noteText;

    example.style.borderColor = borderColor.value;
    example.style.backgroundColor = backColor.value;
    example.style.color = textColor.value;
    example.textContent = noteText.value;
    if (name.checked) {
      example.textContent += " (JerkName)";
    }

    jerks = items.st_jerks;
    populateJerkList();

    keywords = items.st_keywords;
    populateKeywordList();
  });
}

function populateJerkList() {
  if (jerks.length > 0) {
    while(jerkList.firstChild ){
      jerkList.removeChild(jerkList.firstChild );
    }
    jerks.forEach((jerk) => {
      const entry = document.createElement("li");
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
    while(keywordList.firstChild ){
      keywordList.removeChild(keywordList.firstChild );
    }
    keywords.forEach((keyword) => {
      const entry = document.createElement("li");
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
  if(e.target && e.target.nodeName === "A") {
    const i = jerks.indexOf(e.target.id);
    jerks.splice(i, 1);
    save_options();
    restore_options();
  }
});

keywordList.addEventListener("click", (e) => {
  if(e.target && e.target.nodeName === "A") {
    const i = keywords.indexOf(e.target.id);
    keywords.splice(i, 1);
    save_options();
    restore_options();
  }
});
