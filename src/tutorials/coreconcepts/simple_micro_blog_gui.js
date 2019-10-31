// Connect
var holochain_connection = holochainclient.connect({
  url: 'ws://localhost:3401',
});

// Render functions
function show_output(result, id) {
  var el = document.getElementById(id);
  var output = JSON.parse(result);
  if (output.Ok) {
    el.textContent = ' ' + output.Ok;
  } else {
    alert(output.Err.Internal);
  }
}

function show_person(result) {
  var person = document.getElementById('person_output');
  var output = JSON.parse(result);
  person.textContent = ' ' + output.Ok.name;
}

// Zome calls

function hello() {
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'hello_holo')({args: {}}).then(result =>
      show_output(result, 'output'),
    );
  });
}
