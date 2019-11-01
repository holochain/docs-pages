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

function show_posts(result) {
  var list = document.getElementById('posts_output');
  list.innerHTML = '';
  var output = JSON.parse(result);
  if (!output.Ok) {
    console.log(output);
  }
  var posts = output.Ok.sort((a, b) => a.timestamp - b.timestamp);
  for (post of posts) {
    var node = document.createElement('LI');
    var textnode = document.createTextNode(post.message);
    node.appendChild(textnode);
    list.appendChild(node);
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
  var address = document.getElementById('address_in').value;
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'retrieve_person')({
      address: address,
    }).then(result => show_person(result, 'person_output'));
  });
}
function show_person(result) {
  var person = document.getElementById('person_output');
  var output = JSON.parse(result);
  person.textContent = ' ' + output.Ok.name;
}
