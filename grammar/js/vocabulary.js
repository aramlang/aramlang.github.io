const autoCompleteJS = new autoComplete({
  data: {
    src: async () => {
      try {
        document.getElementById("autoComplete").setAttribute("placeholder", "Loading...");
        const source = await fetch("./db/vocabulary.json");
        const data = await source.json();
        document.getElementById("autoComplete").setAttribute("placeholder", autoCompleteJS.placeHolder);
        return data;
      } catch (error) {
        return error;
      }
    },
    keys: ["English", "Aramaic", "Assyrian", "Aramaic Vocalized", "Assyrian Vocalized"],
    cache: true,
    filter: (list) => {
      // Filter duplicates in case of multiple data keys usage
      const filteredResults = Array.from(new Set(list.map((value) => value.match))).map((food) => {
        return list.find((value) => value.match === food);
      });

      return filteredResults;
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
      let content = data.match;
      switch (data.key) {
        case "English":
          content = `<span>${content}</span> <span class="swadaya">${data.value["Assyrian Vocalized"]}</span> <span class="estrangela">${data.value["Aramaic Vocalized"]}</span>`;
          break;
        case "Aramaic":
          content = `<span class="estrangela">${content}</span> <span>${data.value["English"]}</span> <span class="swadaya">${data.value["Assyrian Vocalized"]}</span>`;
          break;
        case "Assyrian":
          content = `<span class="swadaya">${content}</span> <span>${data.value["English"]}</span> <span class="estrangela">${data.value["Aramaic Vocalized"]}</span>`;
          break;
        case "Aramaic Vocalized":
          content = `<span class="estrangela">${content}</span> <span>${data.value["English"]}</span> <span class="swadaya">${data.value["Assyrian Vocalized"]}</span>`;
          break;
        case "Assyrian Vocalized":
          content = `<span class="swadaya">${content}</span> <span>${data.value["English"]}</span> <span class="estrangela">${data.value["Aramaic Vocalized"]}</span>`;
          break;
        default:
          break;
      }
      item.innerHTML = `
      <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
        ${content}
      </span>
      <span style="display: flex; align-items: center; font-size: 13px; font-weight: 100; color: rgba(0,0,0,.2);">
        ${data.key}
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
        elems.length && elems[0].classList.remove("selection");
        const feedback = event.detail;
        autoCompleteJS.input.blur();
        const hash = feedback.selection.value["English"];
        const selection = feedback.selection.value[feedback.selection.key];
        const elem = document.getElementById(hash);
        if (elem) {
          elem.classList.add("selection");
          elem.scrollIntoView();
        }
        autoCompleteJS.input.value = selection;
        console.log(feedback);
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

