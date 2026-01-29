(function() {

  'use strict';

  let showJerksName;
  let hideBriefNote;
  let briefNote;
  let showPeek;
  let noteBorderColor;
  let noteBackColor;
  let noteTextColor;
  let muteQuotes;
  let showQuotePeek
  let muteThreads;
  let muteKeywords;
  let jerks;
  let keywords;

  retrieveData(() => { addMuteButton(); }, () => { processPage(); });

  function retrieveData(callback1, callback2, callback3 ) {
    chrome.storage.sync?.get({
      st_quotes: true,
      st_quotepeek: false,
      st_threads: false,
      st_phrases: false,
      st_disable: false,
      st_name: false,
      st_peek: false,
      st_borderColor: '#656565',
      st_backColor: '#656565',
      st_textColor: '##cccccc',
      st_noteText: 'Muted',
      st_jerks: ['JerkMcJerkyface'],
      st_keywords: ['literally hitler']
    }, (items) => {
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
      callback1();
      callback2();
      callback3();
    });
  }

  function processPage() {
    processClass('b_u_name', jerks);

    if (muteQuotes) {
      processClass('quot_user_name', jerks);
    }

    if (muteThreads) {
      processClass('user__name', jerks);
    }

    if (muteKeywords) {
      processClass('topic_s', keywords)
    }
  }

  function processClass(cssClass, list) {
    let boiler = { front: '', text: '', back: '' };
    let postContent = '';
    let allNodes = document.getElementsByClassName(cssClass);
    let orignalNodesLength = allNodes.length;
    for (let i = 0; i < allNodes.length; i++) {

      postContent = getContent(allNodes[i], cssClass);

      for (let j = 0; j < list.length; j++) {

        if (((allNodes[i].textContent === list[j] || allNodes[i].innerHTML === (list[j] + ': ')) && postContent !== boiler.text)
          || cssClass === 'topic_s' && allNodes[i].innerHTML.toLowerCase().includes(list[j])) {

          mute(allNodes[i], cssClass, list[j]);

          if (orignalNodesLength - allNodes.length > i) {
            i = -1;
          } else {
            i -= orignalNodesLength - allNodes.length;
          }

          break;
        }
      }
      boiler.text = '';
      boiler.front = '';
      boiler.back = '';
    }
  }

  function getContent(node, cssClass) {
    switch(cssClass) {
      case 'topic_s':
        return node.innerHTML;
      case 'user__name':
        return node.parentNode.innerHTML;
      case 'quot_user_name':
        return node.parentNode.parentNode.innerHTML;
      return node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.innerHTML;
    }
  }

  function mute(node, cssClass, jerk) {
    switch(cssClass) {
      case 'topic_s':
        node.parentNode.parentNode.removeChild(node.parentNode);
        break;
      case 'user__name':
        node.parentNode.parentNode.parentNode.removeChild(node.parentNode.parentNode);
        break;
      case 'quot_user_name':
        const quote = node.closest('.quot');

        if (quote.dataset.revealReady !== 'yes') {
          quote.dataset.revealReady = 'yes';

          const original = document.createElement('div');
          original.style.display = 'none';

          while (quote.firstChild) original.appendChild(quote.firstChild);
          quote.appendChild(original);

          if (showQuotePeek) {
            const unhide = document.createElement('button');
            const icon = createEyeIcon();
            unhide.appendChild(icon);
            unhide.style.padding = '0';
            unhide.style.border = '0';
            unhide.style.background = 'none';
            unhide.style.cursor = 'pointer';
            unhide.style.lineHeight = '0';
            unhide.classList.add('unhide_quote');
            unhide.addEventListener('click', (e) => {
              quote.dataset.revealReady = ''
              original.style.display = 'block';
              e.target.closest('button').remove();
            });

            quote.prepend(unhide);
          }
        }
        break;
      case 'b_u_name':
        const post = node.closest('.big_post_h');
        post.style.display = 'none';

        if (!hideBriefNote && post.parentNode.firstChild.classList[0] !== 'brief_note') {
          const placeholder = document.createElement('div');
          placeholder.style.color = noteTextColor;
          placeholder.style.background = noteBackColor;
          placeholder.style.border = `1px solide ${noteBorderColor}`;
          placeholder.style.borderRadius = '3px';
          placeholder.style.padding = '3px';
          placeholder.style.margin = '10px 0 0 0';
          placeholder.style.display = 'flex';
          placeholder.style.alignItems = 'center';
          placeholder.textContent = ` ${briefNote}${showJerksName ? ` (${jerk})` : ''}`;
          placeholder.classList.add('brief_note');

          if (showPeek) {
            const unhide = document.createElement('button');
            const icon = createEyeIcon();
            unhide.appendChild(icon);
            unhide.style.padding = '0';
            unhide.style.border = '0';
            unhide.style.background = 'none';
            unhide.style.margin = '0 5px 0 0';
            unhide.style.cursor = 'pointer';
            unhide.style.transform = 'translate(0, 1px)';
            unhide.addEventListener('click', (e) => {
              post.style.display = 'block';
              e.target.closest('.brief_note').remove();
            });

            placeholder.prepend(unhide);
          }

          post.parentNode.prepend(placeholder);
        }
        break;
    }
  }

  function addMuteButton() {
    let nameNodes = document.querySelectorAll('.b_u_name');
    if (!nameNodes.length) {
      return;
    }

    for (let i = 0; i < nameNodes.length; i++) {
      let userName = nameNodes[i].textContent;
      const trashIcon = createTrashIcon();
      trashIcon.style.pointerEvents = 'none';
      trashIcon.style.transform = 'translate(2px, 3px)';
      const link = document.createElement('a');
      link.id = `account--${userName}`;
      link.appendChild(trashIcon);
      nameNodes[i].append(link);
    }
  }

  document.getElementById('mainTemplateHolder')?.addEventListener('click', (e) => {
    if(e.target && e.target.nodeName === 'A' && e.target.id.startsWith('account--')) {
      let userName = e.target.id.slice(9);
      jerks.push(userName);

      chrome.storage.sync?.set({
        st_jerks: jerks
      }, () => {
        processPage();
      });
    }
  });

  // Credit: This is from https://tablericons.com/icon/eye/
  const createEyeIcon = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', '#000000');
    svg.setAttribute('stroke-width', '1');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const pupilPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pupilPath.setAttribute('d', 'M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0');
    const eyePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    eyePath.setAttribute('d', 'M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6');
    svg.appendChild(pupilPath);
    svg.appendChild(eyePath);
    return svg;
  }

  // Credit: This is from https://tablericons.com/icon/trash/
  const createTrashIcon = () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', '#000000');
    svg.setAttribute('stroke-width', '1');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path1.setAttribute('d', 'M4 7l16 0');
    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path2.setAttribute('d', 'M10 11l0 6');
    const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path3.setAttribute('d', 'M14 11l0 6');
    const path4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path4.setAttribute('d', 'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12');
    const path5 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path5.setAttribute('d', 'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3');
    svg.appendChild(path1);
    svg.appendChild(path2);
    svg.appendChild(path3);
    svg.appendChild(path4);
    svg.appendChild(path5);
    return svg;
  }
})();
