document.getElementById("sskhakha").addEventListener("click", function (event) {
  let href = event.target.href;
  let hash = href.substr(href.indexOf("#") + 1);
  console.log(hash);
  let elem = document.getElementById(hash);
  elem && elem.scrollIntoView();
  event.preventDefault();
});

document.querySelectorAll('[href="#header"]').forEach((element) => {
  element.addEventListener("click", (event) => {
    window.scrollTo(0, 0);
    event.preventDefault();
  });
});

document.getElementById("font-family").addEventListener("change", function (event) {
  let fontFamily = event.target.value;
  let elements = document.getElementsByClassName("swadaya");
  for (let i = 0; i < elements.length; i++) {
    const element = elements.item(i);
    element.style.fontFamily = fontFamily;
  }
});

function setupLoop(maxVerse) {
  var startVerse = document.getElementById("start-verse");
  var endVerse = document.getElementById("end-verse");
  if (!startVerse || !endVerse) {
    return;
  }
  for (let i = 1; i <= maxVerse; i++) {
    let opt = document.createElement("option");
    opt.value = i;
    opt.id = "start" + i;
    opt.innerHTML = i;
    startVerse.appendChild(opt);

    opt = document.createElement("option");
    opt.id = "end" + i;
    opt.value = i;
    opt.innerHTML = i;
    endVerse.appendChild(opt);
  }
  endVerse.value = maxVerse;
  startVerse.addEventListener("change", function () {
    let start = parseInt(startVerse.value);
    let end = parseInt(endVerse.value);
    if (start > end) {
      for (let i = 1; i <= maxVerse; i++) {
        document.getElementById("end" + i).removeAttribute("selected");
      }
      document.getElementById("end" + start).setAttribute("selected", true);
    }
  });

  endVerse.addEventListener("change", function () {
    let start = parseInt(startVerse.value);
    let end = parseInt(endVerse.value);
    if (start > end) {
      for (let i = 1; i <= maxVerse; i++) {
        document.getElementById("start" + i).removeAttribute("selected");
      }
      document.getElementById("start" + end).setAttribute("selected", true);
    }
  });
}
