'use strict';

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const CLASS_USER_NAME = 'b_u_name';
const CLASS_QUOT_USER_NAME = 'quot_user_name';
const CLASS_THREAD_USER_NAME = 'user__name';
const CLASS_TOPIC = 'topic_s';
const SELECTOR_LIST_ROW = '.list_row_odd';
const SELECTOR_QUOT = '.quot';
const SELECTOR_BIG_POST = '.big_post_h';

const DEFAULT_OPTIONS = self.JERKMUTER_DEFAULT_OPTIONS;

let showJerksName;
let hideBriefNote;
let briefNote;
let showPeek;
let noteBorderColor;
let noteBackColor;
let noteTextColor;
let muteQuotes;
let showQuotePeek;
let muteThreads;
let muteKeywords;
let jerks;
let keywords;

async function retrieveData() {
  const items = await browserAPI.storage.sync.get(DEFAULT_OPTIONS);
  muteQuotes = items.st_quotes;
  showQuotePeek = items.st_quotepeek;
  muteThreads = items.st_threads;
  muteKeywords = items.st_phrases;
  hideBriefNote = items.st_disable;
  showPeek = items.st_peek;
  showJerksName = items.st_name;
  noteBorderColor = items.st_borderColor;
  noteBackColor = items.st_backColor;
  noteTextColor = items.st_textColor;
  briefNote = items.st_noteText;
  jerks = items.st_jerks;
  keywords = items.st_keywords;
  addMuteButton();
  processPage();
}

retrieveData();

function processPage() {
  processClass(CLASS_USER_NAME, jerks);

  if (muteQuotes) {
    processClass(CLASS_QUOT_USER_NAME, jerks);
  }

  if (muteThreads) {
    processClass(CLASS_THREAD_USER_NAME, jerks);
  }

  if (muteKeywords) {
    processClass(CLASS_TOPIC, keywords);
  }
}

function processClass(cssClass, list) {
  let previousContent = '';
  let allNodes = document.getElementsByClassName(cssClass);
  let originalNodesLength = allNodes.length;

  for (let i = 0; i < allNodes.length; i++) {
    for (let j = 0; j < list.length; j++) {
      const textMatch = allNodes[i].textContent === list[j] || allNodes[i].innerHTML === (list[j] + ': ');
      const topicMatch = cssClass === CLASS_TOPIC &&
        allNodes[i].firstChild?.innerText?.toLowerCase().includes(list[j].toLowerCase());

      if (textMatch || topicMatch) {
        mute(allNodes[i], cssClass, list[j], i);
        break;
      }
    }
  }
}

function getContent(node, cssClass) {
  switch (cssClass) {
    case CLASS_TOPIC:
      return node.innerHTML;
    case CLASS_THREAD_USER_NAME:
      return node.parentNode.innerHTML;
    case CLASS_QUOT_USER_NAME:
      return node.parentNode.parentNode.innerHTML;
    default:
      return node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.innerHTML;
  }
}

function mute(node, cssClass, jerk) {
  switch (cssClass) {
    case CLASS_TOPIC: {
      const row = node.closest(SELECTOR_LIST_ROW);
      if (row) row.style.display = 'none';
      break;
    }
    case CLASS_THREAD_USER_NAME: {
      const row = node.closest(SELECTOR_LIST_ROW);
      if (row) row.style.display = 'none';
      break;
    }
    case CLASS_QUOT_USER_NAME: {
      const quote = node.closest(SELECTOR_QUOT);
      if (!quote) break;

      if (quote.dataset.revealReady !== 'yes') {
        quote.dataset.revealReady = 'yes';

        const original = document.createElement('div');
        original.style.display = 'none';

        while (quote.firstChild) original.appendChild(quote.firstChild);
        quote.appendChild(original);

        if (showQuotePeek) {
          const unhide = createPeekButton(createEyeIcon(), (e) => {
            quote.dataset.revealReady = '';
            original.style.display = 'block';
            e.target.closest('button').remove();
          });
          unhide.classList.add('unhide_quote');
          quote.prepend(unhide);
        }
      }
      break;
    }
    case CLASS_USER_NAME: {
      const post = node.closest(SELECTOR_BIG_POST);
      if (!post) break;

      post.style.display = 'none';

      const firstChild = post.parentNode?.firstChild;
      const firstClass = firstChild?.classList?.[0];
      if (!hideBriefNote && firstClass !== 'brief_note') {
        const placeholder = document.createElement('div');
        applyStyles(placeholder, {
          color: noteTextColor,
          background: noteBackColor,
          border: `1px solid ${noteBorderColor}`,
          borderRadius: '3px',
          padding: '3px',
          margin: '10px 0 0 0',
          display: 'flex',
          alignItems: 'center'
        });
        placeholder.textContent = ` ${briefNote}${showJerksName ? ` (${jerk})` : ''}`;
        placeholder.classList.add('brief_note');

        if (showPeek) {
          const unhide = createPeekButton(createEyeIcon(), (e) => {
            post.style.display = 'block';
            e.target.closest('.brief_note').remove();
          });
          applyStyles(unhide, { margin: '0 5px 0 0', transform: 'translate(0, 1px)' });
          placeholder.prepend(unhide);
        }

        if (post.parentNode) post.parentNode.prepend(placeholder);
      }
      break;
    }
  }
}

function addMuteButton() {
  const nameNodes = document.querySelectorAll(`.${CLASS_USER_NAME}`);
  if (!nameNodes.length) {
    return;
  }

  for (let i = 0; i < nameNodes.length; i++) {
    const userName = nameNodes[i].textContent;
    const trashIcon = createTrashIcon();
    applyStyles(trashIcon, { pointerEvents: 'none', transform: 'translate(2px, 3px)' });
    const link = document.createElement('a');
    link.id = `account--${userName}`;
    link.appendChild(trashIcon);
    nameNodes[i].append(link);
  }
}

function applyStyles(el, styles) {
  for (const [key, value] of Object.entries(styles)) {
    el.style[key] = value;
  }
}

function createSvgIcon(pathDValues) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  applyStyles(svg, { width: '16', height: '16' });
  svg.setAttribute('xmlns', ns);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', '#000000');
  svg.setAttribute('stroke-width', '1');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  for (const d of pathDValues) {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

function createPeekButton(icon, onClick) {
  const button = document.createElement('button');
  applyStyles(button, {
    padding: '0',
    border: '0',
    background: 'none',
    cursor: 'pointer',
    lineHeight: '0'
  });
  button.appendChild(icon);
  button.addEventListener('click', onClick);
  return button;
}

document.getElementById('mainTemplateHolder')?.addEventListener('click', async (e) => {
  const link = e.target?.closest('a[id^="account--"]');
  if (!link) return;

  const userName = link.id.slice(9);
  jerks.push(userName);

  try {
    await browserAPI.storage.sync.set({ st_jerks: jerks });
    processPage();
  } catch (err) {
    console.error('JerkMuter: failed to save or apply mute', err);
  }
});

// Credit: eye icon from https://tablericons.com/icon/eye/
function createEyeIcon() {
  return createSvgIcon([
    'M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0',
    'M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6'
  ]);
}

// Credit: trash icon from https://tablericons.com/icon/trash/
function createTrashIcon() {
  return createSvgIcon([
    'M4 7l16 0',
    'M10 11l0 6',
    'M14 11l0 6',
    'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
    'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3'
  ]);
}
