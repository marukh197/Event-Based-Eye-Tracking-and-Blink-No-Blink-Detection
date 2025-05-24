const uploadBtn        = document.getElementById("upload-btn");
const fileInput        = document.getElementById("aedat");
const progressContainer= document.getElementById("progress-container");
const progressFill     = document.getElementById("progress-fill");
const resultDiv        = document.getElementById("result");
const downloadLink     = document.getElementById("download-link");

uploadBtn.addEventListener("click", async () => {
  // if no file chosen, bail:
  if (!fileInput.files.length) {
    alert("Please pick an AEDAT4 file first.");
    return;
  }

  // disable button so no double‐clicks
  uploadBtn.disabled = true;
  resultDiv.classList.add("hidden");
  progressContainer.classList.remove("hidden");
  progressFill.style.width = "0%";

  const data = new FormData();
  data.append("aedat", fileInput.files[0]);

  // …rest of your existing fetch + progress logic…
  let pct = 0;
  const interval = setInterval(() => {
    pct = Math.min(pct + Math.random() * 10, 90);
    progressFill.style.width = pct + "%";
  }, 200);

  try {
    const resp = await fetch("/process", { method: "POST", body: data });
    const text = await resp.text();
    clearInterval(interval);

    if (!resp.ok) {
      throw new Error(text);
    }

    let json;
    try { json = JSON.parse(text); }
    catch { throw new Error("Invalid JSON from server"); }

    progressFill.style.width = "100%";
    if (json.video_url) {
      downloadLink.href = json.video_url;
      resultDiv.classList.remove("hidden");
    } else {
      throw new Error(json.error || "Unknown error");
    }
  } catch (err) {
    alert("Error processing file:\n" + err.message);
  } finally {
    uploadBtn.disabled = false;
    setTimeout(() => progressContainer.classList.add("hidden"), 500);
  }
});
