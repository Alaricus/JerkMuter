( function() {
  
  "use strict";

  let showJerksName;
  let hideBriefNote;
  let briefNote;
  let noteBorderColor;
  let noteBackColor;
  let noteTextColor;
  let muteQuotes;
  let muteThreads;
  let hideRep;
  let hideLow;
  let muteKeywords;
  let jerks;
  let keywords;

  retrieveData( () => {addMuteButton();}, () => {processPage();}, () => {hideLowRatedMarker();} );  

  function retrieveData( callback1, callback2, callback3 ) {
    chrome.storage.sync.get({
        st_quotes: true,
        st_threads: false,
        st_rep: true,
        st_low: true,
        st_phrases: false,
        st_disable: false,
        st_name: false,
        st_borderColor: "#ff8080",
        st_backColor: "#ffe6e6",
        st_textColor: "#ff8080",
        st_noteText: "Post Muted",
        st_jerks: ["JerkMcJerkyface"],
        st_keywords: ["literally hitler", "politics"]
    }, (items) => {
        muteQuotes = items.st_quotes;
        muteThreads = items.st_threads;
        hideRep = items.st_rep;
        hideLow = items.st_low;
        muteKeywords = items.st_phrases;
        hideBriefNote = items.st_disable;
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
    processClass("b_u_name", jerks);

    if (muteQuotes) {
      processClass("quot_user_name", jerks);
    }

    if (muteThreads) {
      processClass("user__name", jerks);
    }

    if (muteKeywords) {
      processClass("topic_s", keywords)
    }
  }

  function processClass(cssClass, list) {
    let boiler = { front: "", text: "", back: "" };
    let postContent = "";
    let allNodes = document.getElementsByClassName(cssClass);
    let orignalNodesLength = allNodes.length;
    for (let i = 0; i < allNodes.length; i++) {
      
      postContent = getContent(allNodes[i], cssClass);     
          
      for (let j = 0; j < list.length; j++) {
        
        if (((allNodes[i].textContent === list[j] + " [×]" || allNodes[i].innerHTML === (list[j] + ": ")) && postContent !== boiler.text) 
          || cssClass === "topic_s" && allNodes[i].innerHTML.toLowerCase().includes(list[j])) {
          
          if (!hideBriefNote && cssClass !== "user__name" && cssClass !== "topic_s") { 
            buildBoiler(boiler, list[j]);
          }

          mute(allNodes[i], boiler, cssClass);    
          
          if (orignalNodesLength - allNodes.length > i) {
            i = -1;
          } else {
            i -= orignalNodesLength - allNodes.length;
          }

          break;        
        }
      }
      boiler.text = "";
      boiler.front = "";
      boiler.back = ""; 
    }
  }

  function getContent(node, cssClass) {
      switch(cssClass) {
        case "topic_s":
          return node.innerHTML;
        case "user__name":
          return node.parentNode.innerHTML;
        case "quot_user_name":
          return node.parentNode.parentNode.innerHTML;
        case "b_u_name":
          hideReputation(node);
        return node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.innerHTML;
      } 
  }
    
  function hideReputation(node) {
    if (hideRep && node.parentNode.parentNode.nextSibling !== null) {
        node.parentNode.parentNode.nextSibling.childNodes[0].innerHTML = "";
      }
  }

  function buildBoiler(boiler, jerk) {
    boiler.text += briefNote;
    boiler.front = `<div style='color: ${noteTextColor}; 
                         background-color: ${noteBackColor}; 
                         border:1px solid ${noteBorderColor}; 
                         border-radius:3px; padding:3px; 
                         margin-top:10px; opacity: 0.6;'>`;
    boiler.back = "</div>";
    if (showJerksName) { boiler.text += " (" + jerk + ")";}
  }
    
  function mute(node, boiler, cssClass) {
    switch(cssClass) {
      case "topic_s":
        node.parentNode.parentNode.removeChild(node.parentNode);
        break;
      case "user__name":
        node.parentNode.parentNode.parentNode.removeChild(node.parentNode.parentNode);
        break;
      case "quot_user_name":
        node.parentNode.parentNode.innerHTML = boiler.front + boiler.text + boiler.back;
        break;
      case "b_u_name":
        node.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.innerHTML = boiler.front + boiler.text + boiler.back;
        break;
    } 
  }

  function addMuteButton() {
    let nameNodes = document.getElementsByClassName("b_u_name");
    if (nameNodes.length !== 0) {
      for (let i = 0; i < nameNodes.length; i++) {
        let userName = nameNodes[i].textContent;
        nameNodes[i].innerHTML += " <a id='account--" + userName + "' style='color:red;'>[&times;]</a>";
      }
    }
  }

  function hideLowRatedMarker() {
    if (hideLow) {
      let lowNodes = document.getElementsByClassName("post_rate_red");
      if (lowNodes.length !== 0) {
        for (let i = 0; i < lowNodes.length; i++) {
          lowNodes[i].innerHTML = "";
        }
      }
    }
  }

  document.getElementById("mainTemplateHolder").addEventListener("click", (e) => {
    if( e.target && e.target.nodeName === "A") {
        if (e.target.id.startsWith("account--")) {
          let userName = e.target.id.slice(9);
          jerks.push(userName);

          chrome.storage.sync.set({
              st_jerks: jerks
          }, () => {
             processPage();
          });
        }
    }
  });
  
})();