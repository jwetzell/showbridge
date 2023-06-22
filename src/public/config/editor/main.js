const editor = new JSONEditor(document.getElementById('jsoneditor'), {
  mode: 'code',
  modes: ['tree', 'text', 'code', 'form', 'view', 'preview'],
  allowSchemaSuggestions: true,
});

// ctrl or cmd + s to save config
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 's') {
    event.preventDefault();
    updateConfig();
  }
});

//load the current config
$.get('/config', (data) => {
  editor.set(data);
});

//load the schema for the config
$.get('/config/schema', (data) => {
  editor.setSchema(data);
});

function updateConfig() {
  $.ajax({
    method: 'POST',
    url: '/config',
    data: JSON.stringify(editor.get()),
    success: (data) => {
      $('#update_message').addClass('update_successful');
      $('#update_message').text('Config updated succesfully!');
      $('#update_message').fadeIn(200);
      setTimeout(() => {
        $('#update_message').fadeOut(200);
      }, 3000);
    },
    error: (data) => {
      console.error(data);
      let errors = '';
      switch (data.responseJSON.errorType) {
        case 'config_validation':
          $('#update_message').addClass('update_failed');
          errors = data.responseJSON.errors.map((error) => `${error.instancePath} ${error.message}`);
          $('#update_message').text(`${data.responseJSON.msg}\n${errors.join('\n')}`);
          $('#update_message').fadeIn(200);
          setTimeout(() => {
            $('#update_message').fadeOut(200);
          }, 10000);
          break;
        default:
          console.log(`unhandled error type = ${data.responseJSON.errorType}`);
      }
    },
    contentType: 'application/json',
  });
}

//update button
$('#update').on('click', () => {
  updateConfig();
});
