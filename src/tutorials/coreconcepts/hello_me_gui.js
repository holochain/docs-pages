var holochain_connection = holochainclient.connect();
function hello() {
  holochain_connection.then(({callZome, close}) => {
    callZome(
      'test-instance',
      'hello',
      'hello_holo',
    )({args: {}}).then(result => show_output(result));
  });
}
function show_output(result) {
  var span = document.getElementById('output');
  var output = JSON.parse(result);
  span.textContent = ' ' + output.Ok;
}
