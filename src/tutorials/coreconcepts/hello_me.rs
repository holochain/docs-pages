#![feature(proc_macro_hygiene)]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
extern crate holochain_json_derive;
use hdk::{
    error::ZomeApiResult,
};

use hdk_proc_macros::zome;

