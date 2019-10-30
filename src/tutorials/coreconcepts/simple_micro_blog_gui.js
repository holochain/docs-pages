// Connect
var holochain_connection = holochainclient.connect({
  url: 'ws://localhost:3401',
});

function update_port() {
  const port = document.getElementById('port').value;
  holochain_connection = holochainclient.connect({
    url: 'ws://localhost:' + port,
  });
  get_agent_id();
}

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

function get_agent_id() {
  holochain_connection.then(({callZome, close}) => {
    callZome('test-instance', 'hello', 'get_agent_id')({}).then(result =>
      show_output(result, 'agent_id'),
    );
  });
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

function show_person(result) {
  var person = document.getElementById('person_output');
  var output = JSON.parse(result);
  person.textContent = ' ' + output.Ok.name;
}
