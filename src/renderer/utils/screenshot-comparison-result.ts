import html2canvas from "html2canvas";

export function screenshotComparisonResult(headerNode: HTMLDivElement, summaryNode: HTMLDivElement) {
  const div = document.createElement("div");

  try {
    div.style.color = "#334155";
    div.style.setProperty("--p-content-border-color", "#e2e8f0");
    div.style.setProperty("--p-content-background", "#ffffff");

    div.append(headerNode, summaryNode);
    div.style.width = "1920px";
    document.body.append(div);

    html2canvas(div).then(canvas => {
      const img = canvas.toDataURL("image/webp");
      const a = document.createElement("a");
      a.href = img;
      a.download = "result.webp";
      a.click();
    });
  } finally {
    document.body.removeChild(div);
  }
}
