document.addEventListener("DOMContentLoaded", function () {
  const linkToHighlightAnchor = document.getElementById("linkToHighlight");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    setTimeout(function () {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "getSelectedTextAndLinkToHighlight" },
        function (response) {
          if (response && response.linkToHighlight) {
            linkToHighlightAnchor.href = response.linkToHighlight;
            linkToHighlightAnchor.innerHTML = response.selectedText;
          } else {
            linkToHighlightAnchor.href = "";
            linkToHighlightAnchor.innerHTML = "";
          }
        }
      );
    }, 500);
  });

  const saveButton = document.getElementById("saveButton");
  saveButton.addEventListener("click", function () {
    const link = linkToHighlightAnchor.href.trim();
    const text = linkToHighlightAnchor.innerHTML.trim();

    const note = document.getElementById("note");

    if (link && text) {
      chrome.storage.sync.get({ saveWithHighlight: [] }, function (result) {
        const newEntry = {
          link: link,
          text: text,
          note: note.value
        };

        result.saveWithHighlight.push(newEntry);

        console.log(result.saveWithHighlight);

        if (JSON.stringify(result).length < chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
          chrome.storage.sync.set({ saveWithHighlight: result.saveWithHighlight }, function () {
            alert("Entry saved successfully!");
          });
        } else {
          alert("Please enter both the note title and the selected text.");
        }
      });
    }
  });

  const manageButton = document.getElementById("manageButton");
  manageButton.addEventListener("click", function () {
    chrome.tabs.create({ url: chrome.runtime.getURL("manage.html") });
  });
});