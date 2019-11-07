import ClipboardJS from 'clipboard';
(() => {
  new ClipboardJS('.to_clipboard_button');
  const buttons = document.querySelectorAll(".download_card");
  console.log(buttons);
  for (let button of buttons)
  {
      console.log(button);
      button.addEventListener("click", (e) => {
          document.querySelector("#copy_container")
          const packageName = e.target.outerText;
          document.querySelector("#copy_field").value = "cpm install " + packageName;
      });
  }
})();
