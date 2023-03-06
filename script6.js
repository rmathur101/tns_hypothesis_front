let api = "https://thinker.city"
// let api = "http://localhost:8000"
// let api = "https://9e8b-2600-1700-290-da50-71d5-53af-3302-40c1.ngrok.io"

let contentAnnots = null

let authenticated = false;
let jwt = Cookies.get('jwt');
console.log('jwt')
console.log(jwt)
if (jwt) {
  fetch(api + '/check_jwt', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + Cookies.get('jwt')
    }
  })
  .then((res) => {
    if (res.status == 200) {
      authenticated = true;
      getAnnotationsFeed();
    }
  })
}

let searchParams = new URLSearchParams(window.location.search);
let discordCode = searchParams.get("code");
console.log("searchParams:code");
console.log(discordCode);
if (authenticated == false && discordCode) {
  // send code to backend
  fetch(api + '/discord', {
    method: 'POST',
    body: JSON.stringify({'code': discordCode}),
    headers: { 'Content-Type': 'application/json' }
  })
  .then((res) => {
    return res.json()
  })
  .then(data => {
    console.log("data from /discord");
    console.log(data);
    if (data.status_code == 200) {
      Cookies.set('jwt', data.jwt_access_token);
      authenticated = true;

      contentAnnots = data.data.content_annots;

      // remove the code from url (to prevent request to /discord on refresh)
      let url = new URL(window.location.href);
      let params = new URLSearchParams(url.search);
      params.delete("code");
      url.search = params.toString();
      history.pushState({}, "", url);
    }
  });
}

let getAnnotationsFeed = () => {
  fetch(api + '/get_annotations_feed', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + Cookies.get('jwt')
    }
  })
  .then((res) => res.json())
  .then(data => {
    console.log("data from getAnnotationsFeed");
    console.log(data);
    contentAnnots = data.data.content_annots;
  });
}
      
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

document.getElementById('video-link').addEventListener('click', (e) => {
  logEvent('user clicked VIDEO WALKTHROUGH link', null)
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
  fetch(api + '/tns_hypothesis_dashboard_home', {
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
        "AI's Next Trick: Faking Identities": "youdoknowjack",
        "Winds of Paradigm Change: From Early Christians, 1776ers, and Marxists to the Network State": "Jim_Nomad",
        "Friendship at Our Fingertips: How Technology Is Transforming Social Interaction": "Camellia",
        "Go-To-Society Strategy - And Why Network States do Need a Founde…": "peerbase.eth",
        "What exactly is a Network State?": "Tom",
        "Barbell Strategies for everyday life": "Abhisek",
        "Index strategies for everyday life": "Abhisek",
        "Embracing the Fourth Turning": "khrannok",
        "🌋 The network curse: spice islands and digital renaissance": "Nuraling",
        "So, you want to make some content?": "Michael Finney",
        "Panic at the Casino": "youdoknowjack",
        "How to Incorporate AI into The Publishing Process": "grant",
        "A Farewell to Innocence: Crypto Pitfalls That Network States Should Avoid": "Jim_Nomad",
        "Sig's Dairy - Age of Inspiration # 3": "Sig",
        "Authenticity Amplified": "BulldozerMantra",
        "❤️ A 1729 Love Story 🌸": "ojas",
        "AGI Doomers, Not AGI, Will Doom Us All": "Tom",
        "Cultivating a Culture of Innovation: Why Artists are Essential to a Network State": "Camellia",
        "Would the US Founders approve of the Network State?": "MattHarder",
        "Optimalism, Strengthen your Body - DS Compounding": "Dave86(CH)",
        "Web 4.0 - A web for Network States & AI": "Abhisek",
        "Aya (آية)": "MattHarder",
        "Lessons on Building Network States: A Look into the Future": "Camellia",
        "Money, War, Nukes, Entropy, and Bitcoin": "youdoknowjack",
        "A Match Made in Heaven": "khrannok",
        "Zero or Infinity: Part One": "Coleman",
        "📉 The Anti Jevons Paradox: avoiding the eficiency trap": "Nuraling",
        "Developing NFT Project Strategies": "Michael Finney",
        "The Renaissance of Trust": "BulldozerMantra",
        "Seizing the Day: How Network Unions Become Powerbrokers in Democracies": "Jim_Nomad",
        "AI and community Consciousness, Chapter Two - DS Compounding": "Dave86(CH)",
        "Sig's Dairy - Age of Inspiration #5": "Sig" 
      }

      let author = titleAuthorMap[title.trim()]
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

      tableRows = tableRows + `
      <tr class="saved-bookmark-row">
        <td class="bookmark-date" style="text-align: center;">${moment(thisContent.newest_annot_date).format('MMM Do')}</td>
        ${null/*<td style="text-align: center;"><span class="material-symbols-outlined saved-bookmark-info-icon noselect" data-urlid="">info</span></td>*/}
        <td class="bookmark-title-data-cell">
          <a style="text-decoration: none; font-weight: 500; color: black;" class="bookmark-title bookmark-URL-link" target="_blank">${thisContent.title[0]}</a>
          <br/>
          <br/>
          <span>
            <a target="_blank" class="open-URL-link" href=${key}>Open Original</a>
            <span class="material-symbols-outlined view-annot-info" data-placement="bottom" data-toggle="tooltip" title='Open the original article. View annotations on the original using the browser extension. See FAQ for info.'>info</span>
          </span>
          <a style="display: none;" target="_blank" class="open-URL-link" href=${viaHypothesisLink}>Open with Annotations</a>
          <br/>
          <span>
            <a data-content-key=${key} style="cursor: pointer;" target="_blank" class="view-annots-link">View Annotations</a>
            <span class="material-symbols-outlined view-annot-info" data-placement="bottom" data-toggle="tooltip" title='View annotations without leaving this page.'>info</span>
          </span>
        </td>
        ${null/*<td class="bookmark-tags">${getTagsFromURL(url)}</td>*/}
        ${null/*<td class="bookmark-rating">${(url.rating == null ? 'None' : url.rating)}</td>*/}
        <td style="text-align: center;">${getAuthor(thisContent.title[0])}</td>
        <td class="annotators" style="text-align: center;">${thisContent.users.join(', ')} (${thisContent.users.length})</td>
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

    var tooltipElements = document.querySelectorAll('[data-toggle="tooltip"]');
    tooltipElements.forEach(function(element) {
      var tooltip = new bootstrap.Tooltip(element);
    });

    let bookmarkLinks = document.getElementsByClassName("open-URL-link")
    for (const link of bookmarkLinks) {
      let numAnnotsElem = link.parentElement.parentElement.parentElement.getElementsByClassName("num-annots")[0]
      let numComHiddenElem = link.parentElement.parentElement.parentElement.getElementsByClassName("num-com-hidden")[0]
      let annotatorsElem = link.parentElement.parentElement.parentElement.getElementsByClassName("annotators")[0]
      let bookmarkTitle = link.parentElement.parentElement.parentElement.getElementsByClassName("bookmark-title")[0]

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

    let viewAnnotsLinks = document.getElementsByClassName("view-annots-link")
    for (const link of viewAnnotsLinks) {

      link.addEventListener('click', (e) => {

        let numAnnotsElem = link.parentElement.parentElement.parentElement.getElementsByClassName("num-annots")[0]
        let numComHiddenElem = link.parentElement.parentElement.parentElement.getElementsByClassName("num-com-hidden")[0]
        let annotatorsElem = link.parentElement.parentElement.parentElement.getElementsByClassName("annotators")[0]
        let bookmarkTitle = link.parentElement.parentElement.parentElement.getElementsByClassName("bookmark-title")[0]

        contentAnnots = getContentAnnots()

        if (!contentAnnots) {
          let annotsHTML = `
            <div>
              <span style="font-size: 13px;">
                You must authenticate with Discord to view annotations on this dashboard. <a id="auth-link" href="https://discord.com/api/oauth2/authorize?client_id=1025143058116911144&redirect_uri=https://rmathur101.github.io/tns_hypothesis_front/&response_type=code&scope=identify%20guilds" style="color: #716397;">Click here</a> to authenticate with Discord. 
              </span>
            </div>
          `
          document.getElementById("modal-body-text").innerHTML = annotsHTML
          document.getElementById("exampleModalLabel").innerHTML = `Verify TNS Membership`
          document.getElementById("modal-btn").click()

          document.getElementById("auth-link").addEventListener('click', (e) => {
            logEvent('user clicked auth link', null)
          });

          return null
        }

        logEvent('user clicked view annotations', {
          'bookmark_name': bookmarkTitle.innerText,
          'num_annots': numAnnotsElem.innerText,
          'num_com': numComHiddenElem.innerText,
          'annotators': annotatorsElem.innerText,
        })

        let annots = contentAnnots[link.dataset.contentKey]
        annotsHTML = ""
        for (const annot of annots) {

          let quotePart = "<span></span>"
          if (annot.custom_data.quote) {
            quotePart = `
              <div>
                <i style="font-size: 12px;"><b>"${annot.custom_data.quote}"</b></i>
              </div>
            `
          }

          annotsHTML = annotsHTML + `
            <div class="annot">
              ${quotePart}
              <div>
                <span style="font-size: 12px;">${annot.text}</span>
              </div>
              <div style="margin-top: 5px; margin-bottom: 5px;">
                ${renderTags(annot.tags)}
              </div>
              <div style="font-size: 12px;">- ${annot.user}</div>
            </div>
            <br/>
          `
          document.getElementById("modal-body-text").innerHTML = annotsHTML
          document.getElementById("exampleModalLabel").innerHTML = `Annotations for "${annot.title}"`
          document.getElementById("modal-btn").click()

        }

      })
    }

    function getContentAnnots() {
      return contentAnnots
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