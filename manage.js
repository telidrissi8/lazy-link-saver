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

  //// Search ////
  function filterEntries(keyword) {
    chrome.storage.sync.get({ savedWithHighlight: [] }, function (result) {
      const filteredEntries = result.savedWithHighlight.filter((entry) =>
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
    chrome.storage.sync.get({ savedWithHighlight: [] }, function (result) {
      updateList(result.savedWithHighlight);
    });
  }

  const refreshButton = document.getElementById("refreshButton");

  refreshButton.addEventListener("click", function () {
    refreshData();
  });

  //// Export ////
  function exportData() {
    chrome.storage.sync.get({ savedWithHighlight: [] }, function (result) {
      const savedData = JSON.stringify(result.savedWithHighlight);
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
          chrome.storage.sync.get({ savedWithHighlight: [] }, function (result) {
            const mergedData = result.savedWithHighlight.concat(importedData);
            chrome.storage.sync.set({ savedWithHighlight: mergedData }, function () {
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
    importInput.click(); // Trigger the click event on the file input
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

  function createListItem(entry) {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      <a href="${entry.link}" target="_blank">${entry.text}</a>
      <button class="deleteButton" data-url="${entry.link}">Delete</button>
    `;
    return listItem;
  }

  function deleteEntry(url) {
    chrome.storage.sync.get({ savedWithHighlight: [] }, function (result) {
      const savedEntries = result.savedWithHighlight;
      const updatedEntries = savedEntries.filter(function (entry) {
        return entry.link !== url;
      });

      chrome.storage.sync.set({ savedWithHighlight: updatedEntries }, function () {
        updateList(updatedEntries);
      });
    });
  }

  chrome.storage.sync.get({ savedWithHighlight: [] }, function (result) {
    const savedEntries = result.savedWithHighlight;
    updateList(savedEntries);
  });

  savedDataList.addEventListener("click", function (event) {
    if (event.target.classList.contains("deleteButton")) {
      const urlToDelete = event.target.dataset.url;
      confirmDelete(urlToDelete);
    }
  });

  clearButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to clear all saved data?")) {
      chrome.storage.sync.set({ savedWithHighlight: [] }, function () {
        updateList([]); // Update the displayed list with an empty array
      });
    }
  });
});





