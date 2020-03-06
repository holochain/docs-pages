// Connect
var holochain_connection = holochainclient.connect();

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

// Zome calls

function hello() {
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'hello_holo')({args: {}}).then(result =>
      show_output(result, 'output'),
    );
  });
}

function create_person() {
  const name = document.getElementById('name').value;
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'create_person')({
      person: {name: name},
    }).then(result => show_output(result, 'address_output'));
  });
}
function retrieve_person() {
  var address = document.getElementById('address_in').value.trim();
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'retrieve_person')({
      address: address,
    }).then(result => show_person(result, 'person_output'));
  });
}
function show_person(result) {
  var person = document.getElementById('person_output');
  var output = JSON.parse(result);
  if (output.Ok) {
    person.textContent = ' ' + output.Ok.name;
  } else {
    alert(output.Err.Internal);
  }
}
