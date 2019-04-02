extern crate chrono;
use std::fs;
use std::env;
use std::fs::File;
use std::io::prelude::*;
use std::collections::BTreeMap;
use handlebars::Handlebars;
use chrono::{DateTime, Utc};
use serde_json::{Map, Value};

fn main() {

  let version = env::var("HC_VERSION").expect("please set HC_VERSION");
  let version_for_url = env::var("HC_VERSION_FOR_URL").expect("please set HC_VERSION_FOR_URL");
  let rust_version = env::var("HC_RUST_VERSION").expect("please set HC_RUST_VERSION");

  let api_versions_string = fs::read_to_string("api_versions.json")
        .expect("Something went wrong reading api_versions.json");
  let api_versions: Value = serde_json::from_str(api_versions_string.as_str()).unwrap();
  let guide_versions_string = fs::read_to_string("guide_versions.json")
        .expect("Something went wrong reading guide_versions.json");
  let guide_versions: Value = serde_json::from_str(guide_versions_string.as_str()).unwrap();


  // create the handlebars registry
  let mut handlebars = Handlebars::new();

  let html = include_str!("html.template.html");
  let _ = handlebars.register_template_string("html", html);

  let head = include_str!("head.template.html");
  let _ = handlebars.register_template_string("head", head);
  
  let header = include_str!("header.template.html");
  let _ = handlebars.register_template_string("header", header);

  let footer = include_str!("footer.template.html");
  let _ = handlebars.register_template_string("footer", footer);
  let mut footer_data = BTreeMap::new();
  footer_data.insert("version_for_url".to_string(), version_for_url.clone());
  let footer_html = handlebars.render("footer", &footer_data).unwrap();

  // page templates
  let start = include_str!("start.template.html");
  let _ = handlebars.register_template_string("start", start);
  let landing = include_str!("landing.template.html");
  let _ = handlebars.register_template_string("landing", landing);
  let api = include_str!("api.template.html");
  let _ = handlebars.register_template_string("api", api);
  let guide = include_str!("guide.template.html");
  let _ = handlebars.register_template_string("guide", guide);

  // START PAGE

  let mut start_head_data = BTreeMap::new();
  start_head_data.insert("title".to_string(), "Holochain Installation Instructions".to_string());
  let start_head_html = handlebars.render("head", &start_head_data).unwrap();

  let mut start_header_data = BTreeMap::new();
  start_header_data.insert("breadcrumb".to_string(), "Quick Start".to_string());
  let start_header_html = handlebars.render("header", &start_header_data).unwrap();

  let mut start_body_data = BTreeMap::new();
  start_body_data.insert("header".to_string(), start_header_html);
  let now: DateTime<Utc> = Utc::now();
  start_body_data.insert("date".to_string(), now.format("%b%e, %Y").to_string());
  start_body_data.insert("version".to_string(), version.clone());
  start_body_data.insert("version_for_url".to_string(), version_for_url.clone());
  start_body_data.insert("rust_version".to_string(), rust_version.clone());
  let start_body_html = handlebars.render("start", &start_body_data).unwrap();

  let mut start_html_data = BTreeMap::new();
  start_html_data.insert("body_class".to_string(), "body-green".to_string());
  start_html_data.insert("head".to_string(), start_head_html);
  start_html_data.insert("body".to_string(), start_body_html);
  start_html_data.insert("footer".to_string(), footer_html.clone());
  let start_html = handlebars.render("html", &start_html_data).unwrap();

  let mut start_file = File::create("start.html").unwrap();
  let _ = start_file.write_all(start_html.as_bytes());

  // API PAGE

  let mut api_head_data = BTreeMap::new();
  api_head_data.insert("title".to_string(), "Holochain API Reference".to_string());
  let api_head_html = handlebars.render("head", &api_head_data).unwrap();

  let mut api_header_data = BTreeMap::new();
  api_header_data.insert("breadcrumb".to_string(), "API Versions".to_string());
  let api_header_html = handlebars.render("header", &api_header_data).unwrap();

  let mut api_body_data = Map::new();
  api_body_data.insert("header".to_string(), Value::from(api_header_html));
  api_body_data.insert("version".to_string(), Value::from(version.clone()));
  api_body_data.insert("api_versions".to_string(), api_versions);
  let api_body_html = handlebars.render("api", &api_body_data).unwrap();

  let mut api_html_data = BTreeMap::new();
  api_html_data.insert("body_class".to_string(), "body-green".to_string());
  api_html_data.insert("head".to_string(), api_head_html);
  api_html_data.insert("body".to_string(), api_body_html);
  api_html_data.insert("footer".to_string(), footer_html.clone());
  let api_html = handlebars.render("html", &api_html_data).unwrap();

  let _ = fs::create_dir("api");
  let mut api_file = File::create("api/index.html").unwrap();
  let _ = api_file.write_all(api_html.as_bytes());

  // GUIDE PAGE

  let mut guide_head_data = BTreeMap::new();
  guide_head_data.insert("title".to_string(), "Holochain Guidebook Versions".to_string());
  let guide_head_html = handlebars.render("head", &guide_head_data).unwrap();

  let mut guide_header_data = BTreeMap::new();
  guide_header_data.insert("breadcrumb".to_string(), "Guidebook".to_string());
  let guide_header_html = handlebars.render("header", &guide_header_data).unwrap();

  let mut guide_body_data = Map::new();
  guide_body_data.insert("header".to_string(), Value::from(guide_header_html));
  guide_body_data.insert("version".to_string(), Value::from(version.clone()));
  guide_body_data.insert("guide_versions".to_string(), guide_versions);
  let guide_body_html = handlebars.render("guide", &guide_body_data).unwrap();

  let mut guide_html_data = BTreeMap::new();
  guide_html_data.insert("body_class".to_string(), "body-green".to_string());
  guide_html_data.insert("head".to_string(), guide_head_html);
  guide_html_data.insert("body".to_string(), guide_body_html);
  guide_html_data.insert("footer".to_string(), footer_html.clone());
  let guide_html = handlebars.render("html", &guide_html_data).unwrap();

  let _ = fs::create_dir("guide");
  let mut guide_file = File::create("guide/index.html").unwrap();
  let _ = guide_file.write_all(guide_html.as_bytes());

  // LANDING PAGE

  let mut landing_head_data = BTreeMap::new();
  landing_head_data.insert("title".to_string(), "Holochain Developer Documentation".to_string());
  let landing_head_html = handlebars.render("head", &landing_head_data).unwrap();

  let mut landing_body_data = BTreeMap::new();
  landing_body_data.insert("version".to_string(), version.clone());
  let landing_body_html = handlebars.render("landing", &landing_body_data).unwrap();

  let mut landing_html_data = BTreeMap::new();
  landing_html_data.insert("body_class".to_string(), "landing-page".to_string());
  landing_html_data.insert("head".to_string(), landing_head_html);
  landing_html_data.insert("body".to_string(), landing_body_html);
  landing_html_data.insert("footer".to_string(), footer_html.clone());
  let landing_html = handlebars.render("html", &landing_html_data).unwrap();

  let mut landing_file = File::create("index.html").unwrap();
  let _ = landing_file.write_all(landing_html.as_bytes());
}