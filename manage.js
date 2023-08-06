document.addEventListener("DOMContentLoaded", function () {
  const savedDataList = document.getElementById("savedDataList");
  const clearButton = document.getElementById("clearButton");

  //// Common ////
  function updateList(savedEntries) {
    savedDataList.innerHTML = "";
    savedEntries.forEach(function (entry) {
      const listItem = createListItem(entry);
      savedDataList.appendChild(listItem);
    });
  }

  function createListItem(entry) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
    <div class="entry-details">
      <a href="${entry.link}" target="_blank">${entry.text}</a>
      ${entry.note ? `<p class="note">${entry.note}</p>` : ''}
    </div>
    <button class="deleteButton" data-url="${entry.link}">Delete</button>
    `;
    return listItem;
  }

  //// Search ////
  function filterEntries(keyword) {
    chrome.storage.sync.get({ lazyLinkSaver: [] }, function (result) {
      const filteredEntries = result.lazyLinkSaver.filter((entry) =>
        entry.text.toLowerCase().includes(keyword.toLowerCase())
      );
      updateList(filteredEntries);
    });
  }

  const searchInput = document.getElementById("searchInput");
  
  searchInput.addEventListener("input", function () {
    const keyword = searchInput.value.trim().toLowerCase();
    filterEntries(keyword);
  });

  //// Refresh ////
  function refreshData() {
    document.getElementById("searchInput").value = "";
    chrome.storage.sync.get({ lazyLinkSaver: [] }, function (result) {
      updateList(result.lazyLinkSaver);
    });
  }

  const refreshButton = document.getElementById("refreshButton");

  refreshButton.addEventListener("click", function () {
    refreshData();
  });

  //// Export ////
  function exportData() {
    chrome.storage.sync.get({ lazyLinkSaver: [] }, function (result) {
      const savedData = JSON.stringify(result.lazyLinkSaver);
      const blob = new Blob([savedData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "saved_data.json";
      a.click();

      URL.revokeObjectURL(url);
    });
  }

  const exportButton = document.getElementById("exportButton");

  exportButton.addEventListener("click", function () {
    exportData();
  });

  //// Import ////
  function importData(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      try {
        const importedData = JSON.parse(event.target.result);
        if (Array.isArray(importedData)) {
          chrome.storage.sync.get({ lazyLinkSaver: [] }, function (result) {
            const mergedData = result.lazyLinkSaver.concat(importedData);
            chrome.storage.sync.set({ lazyLinkSaver: mergedData }, function () {
              updateList(mergedData);
            });
          });
        } else {
          throw new Error("Invalid data format.");
        }
      } catch (error) {
        alert("Error importing data. Please check the file format.");
      }
    };

    reader.readAsText(file);
  }

  const importButton = document.getElementById("importButton");
  const importInput = document.getElementById("importInput");

  importButton.addEventListener("click", function () {
    importInput.click();
  });

  importInput.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      importData(file);
    }
  });

  //// Delete ////
  function confirmDelete(url) {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteEntry(url);
    }
  }

  function deleteEntry(url) {
    chrome.storage.sync.get({ lazyLinkSaver: [] }, function (result) {
      const savedEntries = result.lazyLinkSaver;
      const updatedEntries = savedEntries.filter(function (entry) {
        return entry.link !== url;
      });

      chrome.storage.sync.set({ lazyLinkSaver: updatedEntries }, function () {
        updateList(updatedEntries);
      });
    });
  }

  savedDataList.addEventListener("click", function (event) {
    if (event.target.classList.contains("deleteButton")) {
      const urlToDelete = event.target.dataset.url;
      confirmDelete(urlToDelete);
    }
  });

  clearButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all saved data?")) {
      chrome.storage.sync.set({ lazyLinkSaver: [] }, function () {
        updateList([]);
      });
    }
  });

  //// Main ////
  chrome.storage.sync.get({ lazyLinkSaver: [] }, function (result) {
    const savedEntries = result.lazyLinkSaver;
    updateList(savedEntries);
  });
});





