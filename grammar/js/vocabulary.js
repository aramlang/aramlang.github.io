const autoCompleteJS = new autoComplete({
  data: {
    src: async () => {
      try {
        document.getElementById("autoComplete").setAttribute("placeholder", "Loading...");
        const source = await fetch("db/vocabulary.json");
        const data = await source.json();
        document.getElementById("autoComplete").setAttribute("placeholder", autoCompleteJS.placeHolder);
        return data;
      } catch (error) {
        return error;
      }
    },
    keys: ["en", "av", "sv", "ar", "sy"],
    cache: true,
    filter: (list) => {
      if (!list || !list.length) {
        return list;
      }

      // return a single result per English match
      let result = [];
      let lastEntry = list[0];
      let lastKey = lastEntry.key;
      let lastEn = lastEntry.value.en;

      for (let i = 1; i < list.length; i++) {
        let entry = list[i];
        if (lastEn === entry.value.en) {
          if (lastKey === "en" || lastKey == "av" || lastKey == "sv" || lastKey == "ar") {
            continue; // already have highest precedence entry
          }
          lastEntry = entry;
          lastKey = entry.key;
        }
        else {
          result.push(lastEntry)
          lastEntry = entry
          lastEn = entry.value.en;
          lastKey = entry.key;
        }
      }

      result.push(lastEntry);

      return result;
    },
  },
  placeHolder: "Search for Words",
  resultsList: {
    element: (list, data) => {
      const info = document.createElement("p");
      if (data.results.length) {
        info.innerHTML = `Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
      } else {
        info.innerHTML = `Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
      }
      list.prepend(info);
    },
    noResults: true,
    maxResults: 15,
    tabSelect: true,
  },
  resultItem: {
    element: (item, data) => {
      item.style = "display: flex; justify-content: space-between;";
      let content = data.match.replace(/(<\/mark>)([\u0730-\u074A]+)/g, "$2$1"); // put diacritics inside mark tag 
      switch (data.key) {
        case "en":
          content = `<span>${content}</span> <span class="estrangela" dir="rtl">${data.value["av"]}</span> | <span class="swadaya" dir="rtl">${data.value["sv"]}</span>`;
          break;
        case "ar":
          content = `<span>${data.value["en"]}</span> <span class="estrangela" dir="rtl">${content}</span> | <span class="swadaya" dir="rtl">${data.value["sv"]}</span>`;
          break;
        case "sy":
          content = `<span>${data.value["en"]}</span> <span class="estrangela" dir="rtl">${data.value["av"]}</span> | <span class="swadaya" dir="rtl">${content} ؛ </span>`;
          break;
        case "av":
          content = `<span>${data.value["en"]}</span> <span class="estrangela" dir="rtl">${content}</span> | <span class="swadaya" dir="rtl">${data.value["sv"]}</span>`;
          break;
        case "sv":
          content = `<span>${data.value["en"]}</span> <span class="estrangela" dir="rtl">${data.value["av"]}</span> | <span class="swadaya" dir="rtl">${content}</span>`;
          break;
        default:
          break;
      }
      let category = "English";
      switch (data.key) {
        case "en":
          category = "English";
          break;
        case "av":
          category = "Aramaic";
          break;
        case "sv":
          category = "Assyrian";
          break;
        case "ar":
          category = "Aramaic";
          break;
        case "sy":
          category = "Assyrian";
          break;
        default:
          break;
      }
      item.innerHTML = `
      <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
        ${content}
      </span>
      <span style="display: flex; align-items: center; font-size: 13px; font-weight: 100; color: rgba(0,0,0,.2);">
        ${category}
      </span>`;
    },
    highlight: true,
  },
  events: {
    input: {
      focus() {
        if (autoCompleteJS.input.value.length) autoCompleteJS.start();
      },
      selection(event) {
        const elems = document.getElementsByClassName("selection");
        if (elems) {
          for(let i = 0; i < elems.length; i++) {
            let elem = elems[0];
            elem.classList.remove("selection");
          }
        }
        elems.length && elems[0].classList.remove("selection");
        const feedback = event.detail;
        autoCompleteJS.input.blur();
        const hash = feedback.selection.value["en"].replace(/ /g, "_");
        const selection = feedback.selection.value[feedback.selection.key];
        const eng = document.getElementById(hash);
        const ara = document.getElementById(`${hash}-ar`)
        const ass = document.getElementById(`${hash}-sy`)
        if (eng) {
          eng.classList.add("selection");
          eng.scrollIntoView();
        }
        if (ara) {
          ara.classList.add("selection");
          eng || ara.scrollIntoView();
        }
        if (ass) {
          ass.classList.add("selection");
          eng || ara || ass.scrollIntoView();
        }
        autoCompleteJS.input.value = selection;
        if (!eng && !ara && !ass) {
          console.log(hash);
        }
      },
    },
  },
});

// Toggle Search Engine Type/Mode
document.querySelector(".toggler").addEventListener("click", () => {
  // Holds the toggle button selection/alignment
  const toggle = document.querySelector(".toggle").style.justifyContent;

  if (toggle === "flex-start" || toggle === "") {
    // Set Search Engine mode to Loose
    document.querySelector(".toggle").style.justifyContent = "flex-end";
    document.querySelector(".toggler").innerHTML = "Loose";
    autoCompleteJS.searchEngine = "loose";
  } else {
    // Set Search Engine mode to Strict
    document.querySelector(".toggle").style.justifyContent = "flex-start";
    document.querySelector(".toggler").innerHTML = "Strict";
    autoCompleteJS.searchEngine = "strict";
  }
});

document.getElementById("autoComplete").addEventListener("keyup", (event) => {
  let input = event.target;
  input.dir = !input.value || /^[\u0000-\u007F]+$/.test(input.value) ? "ltr" : "rtl";
});

document.querySelectorAll('[href="#header"]').forEach((element) => {
  element.addEventListener("click", (event) => {
    window.scrollTo(0, 0);
    event.preventDefault();
  });
});

document.getElementById("letters").addEventListener("click", (event) => {
  let href = event.target.href;
  let id = href.charAt(href.length - 1)
  document.getElementById(id).scrollIntoView();
  event.preventDefault();
});