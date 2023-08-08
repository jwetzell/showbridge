export function downloadJSON(data: any, filename: string) {
  const content = JSON.stringify(data, null, 2);
  const dataUri = URL.createObjectURL(
    new Blob([content], {
      type: 'text/json;charset=utf-8',
    })
  );
  const dummyLink = document.createElement('a');
  dummyLink.href = dataUri;
  dummyLink.download = filename;

  document.body.appendChild(dummyLink);
  dummyLink.click();
  document.body.removeChild(dummyLink);
}
