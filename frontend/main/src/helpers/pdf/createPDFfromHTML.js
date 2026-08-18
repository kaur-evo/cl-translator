import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

export default async function createPDFfromHTML(refsList) {
  const pdf = new jsPDF({ orientation: 'landscape' });
  const MAX_WIDTH = Math.max(...refsList.map((el) => el.offsetWidth));

  const MARGIN = 5;
  const PAGE_WIDTH = pdf.internal.pageSize.getWidth() - (2 * MARGIN);
  const PAGE_HEIGHT = pdf.internal.pageSize.getHeight();
  const PAGE_HEIGHT_WITHOUT_MARGIN = pdf.internal.pageSize.getHeight() - (2 * MARGIN);
  const MAX_SCALE_FACTOR = 1.5;
  const scaleFactor = Math.min(MAX_SCALE_FACTOR, PAGE_WIDTH / MAX_WIDTH);
  let currentPageYPos = 0;
  for (let i = 0; i < refsList.length; i += 1) {
    const HTML_ELEMENT = refsList[i];
    const CANVAS_IMAGE_WIDTH = HTML_ELEMENT.offsetWidth * scaleFactor;
    const CANVAS_IMAGE_HEIGHT = HTML_ELEMENT.offsetHeight * scaleFactor;

    const canvas = await html2canvas(HTML_ELEMENT);
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    let newPageYPos;
    if (currentPageYPos && ((currentPageYPos + CANVAS_IMAGE_HEIGHT) > PAGE_HEIGHT_WITHOUT_MARGIN)) {
      pdf.addPage();
      currentPageYPos = 0;
      newPageYPos = 0;
    } else {
      newPageYPos = currentPageYPos + CANVAS_IMAGE_HEIGHT;
    }

    const totalPDFPages = Math.ceil((CANVAS_IMAGE_HEIGHT) / PAGE_HEIGHT) - 1;
    pdf.addImage(imgData, 'JPG', MARGIN, MARGIN + currentPageYPos, CANVAS_IMAGE_WIDTH, CANVAS_IMAGE_HEIGHT);

    for (let i2 = 1; i2 <= totalPDFPages; i2 += 1) {
      pdf.addPage();
      pdf.addImage(imgData, 'JPG', MARGIN, -(PAGE_HEIGHT * i2) + MARGIN, CANVAS_IMAGE_WIDTH, CANVAS_IMAGE_HEIGHT, PAGE_HEIGHT_WITHOUT_MARGIN);
      newPageYPos = 0;
    }
    currentPageYPos = newPageYPos;
  }

  pdf.save(`Report${new Date().toLocaleDateString()}.pdf`);
}
