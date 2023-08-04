document.addEventListener("DOMContentLoaded", function () {
  const linkToHighlightAnchor = document.getElementById("linkToHighlight");
  const saveButton = document.getElementById("saveButton");
  const manageButton = document.getElementById("manageButton");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs || !tabs[0] || tabs[0].url.startsWith("chrome") || tabs[0].url.startsWith("chrome")) {
      return;
    } else {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getSelectedTextAndLinkToHighlight" }, function (
        response
      ) {
          linkToHighlightAnchor.href = response.linkToHighlight;
          linkToHighlightAnchor.innerHTML = response.selectedText;
      });
    }
  });

  saveButton.addEventListener("click", function () {
    const link = linkToHighlightAnchor.href.trim();
    const text = linkToHighlightAnchor.innerHTML.trim();

    if (link && text) {
      chrome.storage.sync.get({ savedWithHighlight: [] }, function (result) {
        const newEntry = {
          link: link,
          text: text,
        };

        result.savedWithHighlight.push(newEntry);

        console.log(result.savedWithHighlight);

        if (JSON.stringify(result).length < chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
          chrome.storage.sync.set({ savedWithHighlight: result.savedWithHighlight }, function () {
            alert("Entry saved successfully!");
          });
        } else {
          alert("Please enter both the note title and the selected text.");
        }
      });
    }
  });

  manageButton.addEventListener("click", function () {
    chrome.tabs.create({ url: chrome.runtime.getURL("manage.html") });
  });
});