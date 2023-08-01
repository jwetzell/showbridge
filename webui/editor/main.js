const container = document.getElementById('jsoneditor');
const options = {
  mode: 'code',
  modes: ['tree', 'text', 'code', 'form', 'view', 'preview'],
};
const editor = new JSONEditor(container, options);

function loadConfig() {
  $.get(`/config`, (data) => {
    editor.set(data);
  });

  $.get(`/config/schema`, (data) => {
    editor.setSchema(data);
  });
}

$('#updateConfig').on('click', () => {
  $.ajax({
    method: 'POST',
    url: `/config`,
    data: JSON.stringify(editor.get()),
    success: (data) => {
      console.log(data);
      alert(`Config successfully updated.\n\n${data.msg}`);
    },
    error: (data) => {
      console.error(data);
      let errors = '';
      switch (data.responseJSON.errorType) {
        case 'config_validation':
          errors = data.responseJSON.errors.map((error) => `${error.instancePath} ${error.message}`);
          break;
        default:
          console.log(`unhandled error type = ${data.responseJSON.errorType}`);
      }
      alert(`${data.responseJSON.msg}\n${errors.join('\n')}`);
    },
    contentType: 'application/json',
  });
});
