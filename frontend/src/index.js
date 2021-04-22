import ClipboardJS from 'clipboard';
(() => {
  new ClipboardJS('.to_clipboard_button');
  const buttons = document.querySelectorAll(".download_card");
  for (let button of buttons)
  {
      button.addEventListener("click", (e) => {
          document.querySelector("#copy_container")
          const packageName = e.target.getAttribute("data");
          document.querySelector("#copy_field").value = "cfbs install " + packageName;
      });
  }
})();
