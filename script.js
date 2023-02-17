let api = "https://thinker.city"
// let api = "http://localhost:8000"
// let api = "https://9e8b-2600-1700-290-da50-71d5-53af-3302-40c1.ngrok.io"

document.addEventListener('DOMContentLoaded', function() {
  var tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
  tooltipElements.forEach(function(element) {
    var tooltip = new bootstrap.Tooltip(element);
  });
});

function logEvent(event, otherData) {
  fetch(api + '/log_event', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
    },
    body: JSON.stringify({
      "event": event,
      "other_data": otherData
    })
  })
  .then((res) => res.json())
  .then(data => {
    console.log("data from logEvent");
    console.log(data);
  });
}

document.getElementById('faq-link').addEventListener('click', (e) => {
  logEvent('user clicked FAQ link', null)
})

document.getElementById('join-group-link').addEventListener('click', (e) => {
  logEvent('user clicked JOIN GROUP link', null)
})

document.getElementById('default-toggled-sort-icon').addEventListener('click', (e) => {
  logEvent('user clicked last annotated sort', null)
})

document.getElementById('name-sort').addEventListener('click', (e) => {
  logEvent('user clicked name sort', null)
})

document.getElementById('num-annots-sort').addEventListener('click', (e) => {
  logEvent('user clicked num annotations sort', null)
})

function getAnnots() {
  fetch(api + '/', {
    method: 'GET',
    headers: { 
      'Content-Type': 'application/json', 
      // 'Authorization': 'Bearer ' + Cookies.get('jwt')
    }
  })
  .then((res) => res.json())
  .then(data => {
    console.log("data from getAnnots");
    console.log(data);

    let contentMetadata = data.data.content_metadata;

    let getAuthor = (title) => {
      let titleAuthorMap = {
        "1729.cloud: A nostr relay for The Network State (TNS)": "ojas",
        "Three global shifts driving us toward the Network State": "MattHarder",
        "Why Your Online Community May Need An Educational Program": "grant",
        "Teach AI How to Not Be a Dick": "Dozer",
        "Powerful Populations": "khrannok",
        "Artificial Intelligence and Collective Consciousness - DS Compounding": "Dave86(CH)",
        "AI's Next Trick: Faking Identities": "youdoknowjack"
      }

      let author = titleAuthorMap[title]
      if (author == null) {
        return "NA"
      } else {
        return author
      }
    }

    let tableRows = "";
    for (let i in (Object.keys(contentMetadata))) {
      let key = Object.keys(contentMetadata)[i];
      let viaHypothesisLink = "https://via.hypothes.is/" + key;
      let thisContent = contentMetadata[key];
      let dateNum = moment(thisContent.newest_annot_date).valueOf()
      console.log(dateNum)
      console.log(moment(thisContent.newest_annot_date).valueOf())
      console.log('')

      // need a for loop here
      tableRows = tableRows + `
      <tr class="saved-bookmark-row">
        <td class="bookmark-date" style="text-align: center;">${moment(thisContent.newest_annot_date).format('MMM Do')}</td>
        ${null/*<td style="text-align: center;"><span class="material-symbols-outlined saved-bookmark-info-icon noselect" data-urlid="">info</span></td>*/}
        <td class="bookmark-title-data-cell">
          <a style="text-decoration: none; font-weight: 500; color: black;" class="bookmark-title bookmark-URL-link" target="_blank">${thisContent.title[0]}</a>
          <br/>
          <br/>
          <a target="_blank" class="open-URL-link" href=${key}>Open Original</a><br/>
          <a target="_blank" class="open-URL-link" href=${viaHypothesisLink}>Open with Annotations</a>
        </td>
        ${null/*<td class="bookmark-tags">${getTagsFromURL(url)}</td>*/}
        ${null/*<td class="bookmark-rating">${(url.rating == null ? 'None' : url.rating)}</td>*/}
        <td style="text-align: center;">${getAuthor(thisContent.title[0])}</td>
        <td class="annotators" style="text-align: center;">${thisContent.users.join(' ')}</td>
        <td class="num-annots" style="text-align: center;">${thisContent.num_annots}</td>
        <td>${renderTags(thisContent.tags)}</td>
        <td class="bookmark-date-hidden" style="display: none">${dateNum}</td>
        <td class="num-com-hidden" style="display: none">${thisContent.users.length}</td>
      </tr>
      ` 
    }

    // if no bookmarks, display message
    if (tableRows == "") {
      tableRows = `
      <tr class="saved-bookmark-row">
        <td colspan="3" style="text-align: center;">No bookmarks to display.</td>
      </tr>
      `
    } 

    // insert table rows
    document.getElementById("saved-bookmarks-table-body").innerHTML = tableRows

    let bookmarkLinks = document.getElementsByClassName("open-URL-link")
    for (const link of bookmarkLinks) {
      let numAnnotsElem = link.parentElement.parentElement.getElementsByClassName("num-annots")[0]
      let numComHiddenElem = link.parentElement.parentElement.getElementsByClassName("num-com-hidden")[0]
      let annotatorsElem = link.parentElement.parentElement.getElementsByClassName("annotators")[0]
      let bookmarkTitle = link.parentElement.parentElement.getElementsByClassName("bookmark-title")[0]

      link.addEventListener('click', (e) => {
        logEvent('user opened bookmark', {
          'bookmark_name': bookmarkTitle.innerText,
          'num_annots': numAnnotsElem.innerText,
          'num_com': numComHiddenElem.innerText,
          'annotators': annotatorsElem.innerText,
          'open_type': e.target.innerText
        })
      })
    }

    let options = {
      valueNames: [ 'bookmark-title', 'bookmark-date-hidden', 'num-annots'] 
    };
    let savedBookmarksTable = new List('saved-bookmarks-table-cont', options);
    savedBookmarksTable.sort('bookmark-date-hidden', { order: "desc" });

    // sort icons stuff
    let sortIconElems = document.getElementsByClassName('sort-icon')
    let toggledSortIconElem = document.getElementById('default-toggled-sort-icon') 
    for (const elem of sortIconElems) {
      elem.addEventListener('click', (e) => {

        if (toggledSortIconElem && toggledSortIconElem != e.target) {
          toggledSortIconElem.innerText = "swap_vert"
        }

        toggledSortIconElem = e.target

        if (e.target.innerText == "south") {
          e.target.innerText = "north"
        } else {
          e.target.innerText = "south"
        }
      })
    }
  });

}

let renderTags = (tags) => {
  if (tags && tags.length > 0) {
    let returnStr = ''
    for (const tag of tags) {
      returnStr += `<span class="new-tag bi-tag">${tag}</span>`
    }
    return returnStr
  } else {
    return ''
  }
}

getAnnots()