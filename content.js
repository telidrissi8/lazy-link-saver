chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getSelectedTextAndLinkToHighlight") {

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (selectedText === "") {
      console.log("does not work here");
      return;
    } else {
      const lines = selectedText.split('\n');
      let firstLine = lines[0];

      const linkToHighlight = location.href + "#:~:text=" + escape(firstLine).replace(/-/g, '%2D');

      sendResponse({ selectedText: selectedText, linkToHighlight: linkToHighlight });
    }
  }
});