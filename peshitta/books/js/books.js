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
