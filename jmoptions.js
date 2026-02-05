'use strict';

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const quotes = document.querySelector('#quotes');
const quotepeek = document.querySelector('#quotepeek');
const threads = document.querySelector('#threads');
const phrases = document.querySelector('#phrases');
const keywordText = document.querySelector('#keywordtext');
const add = document.querySelector('#add');
const disable = document.querySelector('#disable');
const nameCheckbox = document.querySelector('#name');
const borderColor = document.querySelector('#bordercolor');
const backColor = document.querySelector('#backcolor');
const textColor = document.querySelector('#textcolor');
const noteText = document.querySelector('#notetext');
const peek = document.querySelector('#peek');
const example = document.querySelector('#example');
const exampleimage = document.querySelector('#exampleimage');
const exampletext = document.querySelector('#exampletext');
const jerkList = document.querySelector('#jerklist');
const keywordList = document.querySelector('#keywordlist');

let jerks = [];
let keywords = [];

const FORUM_URL_PATTERN = 'https://www.gog.com/forum/*';

async function saveOptions() {
  await browserAPI.storage.sync.set({
    st_quotes: quotes.checked,
    st_quotepeek: quotepeek.checked,
    st_threads: threads.checked,
    st_phrases: phrases.checked,
    st_disable: disable.checked,
    st_name: nameCheckbox.checked,
    st_borderColor: borderColor.value.trim(),
    st_backColor: backColor.value.trim(),
    st_textColor: textColor.value.trim(),
    st_noteText: noteText.value.trim(),
    st_peek: peek.checked,
    st_jerks: jerks,
    st_keywords: keywords
  });

  try {
    const tabs = await browserAPI.tabs.query({ url: FORUM_URL_PATTERN });
    for (const tab of tabs) {
      if (tab.id) {
        await browserAPI.tabs.reload(tab.id);
      }
    }
  } catch {
    console.error('Jerkmuter: Failed to reload forum tabs.');
  }
}

async function restoreOptions() {
  const items = await browserAPI.storage.sync.get(self.JERKMUTER_DEFAULT_OPTIONS);
  quotes.checked = items.st_quotes;
  quotepeek.checked = items.st_quotepeek;
  threads.checked = items.st_threads;
  phrases.checked = items.st_phrases;
  disable.checked = items.st_disable;
  nameCheckbox.checked = items.st_name;
  borderColor.value = items.st_borderColor;
  backColor.value = items.st_backColor;
  textColor.value = items.st_textColor;
  noteText.value = items.st_noteText;
  peek.checked = items.st_peek;

  updateExamplePreview();

  jerks = items.st_jerks;
  populateJerkList();

  keywords = items.st_keywords;
  populateKeywordList();
}

function populateJerkList() {
  if (jerks.length > 0) {
    while (jerkList.firstChild) {
      jerkList.removeChild(jerkList.firstChild);
    }
    jerks.forEach((jerk) => {
      const entry = document.createElement('li');
      entry.appendChild(document.createTextNode(jerk));
      const link = document.createElement('a');
      link.setAttribute('data-jerk', jerk);
      link.textContent = 'unmute';
      entry.appendChild(document.createTextNode(' '));
      entry.appendChild(link);
      jerkList.appendChild(entry);
    });
  } else {
    document.querySelector('#showjerks').style.display = 'none';
  }
}

function populateKeywordList() {
  if (keywords.length > 0) {
    while (keywordList.firstChild) {
      keywordList.removeChild(keywordList.firstChild);
    }
    keywords.forEach((keyword) => {
      const entry = document.createElement('li');
      entry.appendChild(document.createTextNode(keyword));
      const link = document.createElement('a');
      link.setAttribute('data-keyword', keyword);
      link.textContent = 'unmute';
      entry.appendChild(document.createTextNode(' '));
      entry.appendChild(link);
      keywordList.appendChild(entry);
    });
  } else {
    document.querySelector('#showkeywords').style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);

quotes.addEventListener('change', async () => {
  quotepeek.disabled = !quotes.checked;

  await saveOptions();
});

quotepeek.addEventListener('change', saveOptions);
threads.addEventListener('change', saveOptions);
phrases.addEventListener('change', saveOptions);
disable.addEventListener('change', async () => {
  noteText.disabled = disable.checked;
  borderColor.disabled = disable.checked;
  backColor.disabled = disable.checked;
  textColor.disabled = disable.checked;
  nameCheckbox.disabled = disable.checked;
  peek.disabled = disable.checked;
  example.style.visibility = disable.checked ? 'hidden' : 'visible';

  await saveOptions();
});

add.addEventListener('click', async () => {
  if (keywordText.value !== '') {
    keywords.push(keywordText.value.trim());
    document.querySelector('#showkeywords').style.display = 'block';
    populateKeywordList();
    await saveOptions();
  }
});

nameCheckbox.addEventListener('click', async () => {
  updateExamplePreview();
  await saveOptions();
});
noteText.addEventListener('input', updateExamplePreview);
noteText.addEventListener('change', saveOptions);
peek.addEventListener('change', async () => {
  updateExamplePreview();
  await saveOptions();
});

function updateExamplePreview() {
  example.style.visibility = disable.checked ? 'hidden' : 'visible';
  example.style.borderColor = borderColor.value;
  example.style.backgroundColor = backColor.value;
  example.style.color = textColor.value;
  exampletext.textContent = noteText.value.toString();
  if (nameCheckbox.checked) {
    exampletext.textContent += ' (JerkName)';
  }
  exampleimage.style.display = peek.checked ? 'inline' : 'none';
}

borderColor.addEventListener('input', updateExamplePreview);
borderColor.addEventListener('change', async () => {
  updateExamplePreview();
  await saveOptions();
});
backColor.addEventListener('input', updateExamplePreview);
backColor.addEventListener('change', async () => {
  updateExamplePreview();
  await saveOptions();
});
textColor.addEventListener('input', updateExamplePreview);
textColor.addEventListener('change', async () => {
  updateExamplePreview();
  await saveOptions();
});

jerkList.addEventListener('click', async (e) => {
  const link = e.target?.closest('a[data-jerk]');
  if (link) {
    const jerk = link.getAttribute('data-jerk');
    const i = jerks.indexOf(jerk);
    if (i !== -1) {
      jerks.splice(i, 1);
      populateJerkList();
      await saveOptions();
    }
  }
});

keywordList.addEventListener('click', async (e) => {
  const link = e.target?.closest('a[data-keyword]');
  if (link) {
    const keyword = link.getAttribute('data-keyword');
    const i = keywords.indexOf(keyword);
    if (i !== -1) {
      keywords.splice(i, 1);
      populateKeywordList();
      await saveOptions();
    }
  }
});
