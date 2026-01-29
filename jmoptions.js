'use strict';

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const quotes = document.querySelector('#quotes');
const quotepeek = document.querySelector('#quotepeek');
const threads = document.querySelector('#threads');
const phrases = document.querySelector('#phrases');
const keywordText = document.querySelector('#keywordtext');
const add = document.querySelector('#add');
const disable = document.querySelector('#disable');
const name = document.querySelector('#name');
const borderColor = document.querySelector('#bordercolor');
const backColor = document.querySelector('#backcolor');
const textColor = document.querySelector('#textcolor');
const noteText = document.querySelector('#notetext');
const peek = document.querySelector('#peek');
const example = document.querySelector('#example');
const exampleimage = document.querySelector('#exampleimage');
const exampletext = document.querySelector('#exampletext');
const save = document.querySelector('#save');
const status = document.querySelector('#status');
const jerkList = document.querySelector('#jerklist');
const keywordList = document.querySelector('#keywordlist');

let jerks = [];
let keywords = [];

function save_options() {
  browserAPI.storage.sync?.set({
    st_quotes: quotes.checked,
    st_quotepeek: quotepeek.checked,
    st_threads: threads.checked,
    st_phrases: phrases.checked,
    st_disable: disable.checked,
    st_name: name.checked,
    st_borderColor: borderColor.value.trim(),
    st_backColor: backColor.value.trim(),
    st_textColor: textColor.value.trim(),
    st_noteText: noteText.value.trim(),
    st_peek: peek.checked,
    st_jerks: jerks,
    st_keywords: keywords
  }, () => {
    status.style.display = 'block';
    status.textContent = 'OPTIONS SAVED.';
    setTimeout(() => {
      status.style.display = 'none';
      status.textContent = '';
    }, 1500);
  });
}

function restore_options() {
  browserAPI.storage.sync.get({
    st_quotes: true,
    st_quotepeek: false,
    st_threads: false,
    st_phrases: false,
    st_disable: false,
    st_name: false,
    st_borderColor: '#656565',
    st_backColor: '#656565',
    st_textColor: '#cccccc',
    st_noteText: 'Muted',
    st_peek: false,
    st_jerks: ['JerkMcJerkyface'],
    st_keywords: ['literally hitler']
  }, (items) => {
    quotes.checked = items.st_quotes;
    quotepeek.checked = items.st_quotepeek;
    threads.checked = items.st_threads;
    phrases.checked = items.st_phrases;
    disable.checked = items.st_disable;
    name.checked = items.st_name;
    borderColor.value = items.st_borderColor;
    backColor.value = items.st_backColor;
    textColor.value = items.st_textColor;
    noteText.value = items.st_noteText;
    peek.checked = items.st_peek;

    example.style.borderColor = borderColor.value;
    example.style.backgroundColor = backColor.value;
    example.style.color = textColor.value;
    exampletext.textContent = noteText.value;
    exampleimage.style.display = peek.checked ? 'inline' : 'none';

    if (name.checked) {
      exampletext.textContent += ' (JerkName)';
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
      const entry = document.createElement('li');
      entry.appendChild(document.createTextNode(jerk));
      entry.innerHTML += ' <a id="' + jerk + '">[unmute]</a>';
      jerkList.appendChild(entry);
    });
  } else {
    document.querySelector('#showjerks').style.display = 'none';
  }
}

function populateKeywordList() {
  if (keywords.length > 0) {
    while(keywordList.firstChild ){
      keywordList.removeChild(keywordList.firstChild );
    }
    keywords.forEach((keyword) => {
      const entry = document.createElement('li');
      entry.appendChild(document.createTextNode(keyword));
      entry.innerHTML += ' <a id="' + keyword + '">[unmute]</a>';
      keywordList.appendChild(entry);
    });
  } else {
    document.querySelector('#showkeywords').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', restore_options);

quotes.addEventListener('change', () => {
  if (!quotes.checked) {
    quotepeek.checked = false;
  }
  quotepeek.disabled = !quotes.checked;
});

add.addEventListener('click', () => {
  if (keywordText.value !== '') {
    keywords.push(keywordText.value.trim());
    document.querySelector('#showkeywords').style.display = 'block';
    save_options();
    restore_options();
  }
});

save.addEventListener('click', save_options);

name.addEventListener('click', () => {
  exampletext.textContent = noteText.value
  if (name.checked) {
    exampletext.textContent += ' (JerkName)';
  }
});

noteText.addEventListener('input', () => {
  exampletext.textContent = noteText.value.toString();
  if (name.checked) {
    exampletext.textContent += ' (JerkName)';
  }
});

peek.addEventListener('change', () => {
  exampleimage.style.display = peek.checked ? 'inline' : 'none';
});

borderColor.addEventListener('change', () => {
  example.style.borderColor = borderColor.value;
});

backColor.addEventListener('change', () => {
  example.style.backgroundColor = backColor.value;
});

textColor.addEventListener('change', () => {
  example.style.color = textColor.value;
});

jerkList.addEventListener('click', (e) => {
  if(e.target && e.target.nodeName === 'A') {
    const i = jerks.indexOf(e.target.id);
    jerks.splice(i, 1);
    save_options();
    restore_options();
  }
});

keywordList.addEventListener('click', (e) => {
  if(e.target && e.target.nodeName === 'A') {
    const i = keywords.indexOf(e.target.id);
    keywords.splice(i, 1);
    save_options();
    restore_options();
  }
});
