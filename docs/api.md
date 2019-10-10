# Holochain API Reference

<div id="apis"></div>

<script>
function latest_api() {
const userAction = async () => {
const response = await fetch('https://api.github.com/repos/holochain/holochain-rust/releases');
response.json().then(result => show_api(result));
}
userAction();
}
function show_api(api) {
api = api.split(',');
api = api.filter(x => x.match(/^[v\d]/g));

const latest = api[0];
var apis = document.getElementById('apis');
var l_node = document.createElement("DIV");
l_node.innerHTML = "<p class='latest-api'><a href=\"" + latest + "/hdk\">latest</a></p>";
apis.appendChild(l_node);
for (x of api) {
  const tag_name = x;
  var node = document.createElement("DIV");
  node.innerHTML = "<p><a href=\"" + tag_name + "/hdk\">" + tag_name + "</a></p>";
  apis.appendChild(node);
}
}
function load_api() {
const userAction = async () => {
  const response = await fetch('../custom/holochain-rust-releases.txt');
  if (response.status == 200) {
    response.text().then(result => show_api(result));
  }
}
userAction();
}
load_api();
</script>