#![feature(proc_macro_hygiene)]
#[macro_use]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
#[macro_use]
extern crate holochain_json_derive;

use hdk::{entry_definition::ValidatingEntryType, error::ZomeApiResult};

use hdk::holochain_core_types::{dna::entry_types::Sharing, entry::Entry};

use hdk::holochain_json_api::{error::JsonError, json::JsonString};

use hdk::holochain_persistence_api::cas::content::Address;

use hdk_proc_macros::zome;
#[derive(Serialize, Deserialize, Debug, DefaultJson, Clone)]
pub struct Person {
    name: String,
}
#[zome]
mod hello_zome {
    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }
    /* --- Lines omitted -- */
    #[zome_fn("hc_public")]
    fn hello_holo() -> ZomeApiResult<String> {
        Ok("Hello Holo".into())
    }

    // <---- Add the following lines here.
    #[entry_def]
    fn person_entry_def() -> ValidatingEntryType {
        entry!(
            name: "person",
            description: "Person to say hello to",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | _validation_data: hdk::EntryValidationData<Person>| {
                Ok(())
            }
        )
    }
    #[zome_fn("hc_public")]
    pub fn create_person(person: Person) -> ZomeApiResult<Address> {
        let entry = Entry::App("person".into(), person.into());
        let address = hdk::commit_entry(&entry)?;
        Ok(address)
    }
    #[zome_fn("hc_public")]
    fn retrieve_person(address: Address) -> ZomeApiResult<Person> {
        hdk::utils::get_as_type(address)
    }
}
