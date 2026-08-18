export default function downloadFile(input, fileName) {
  const url = window.URL.createObjectURL(new Blob([input]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
}
