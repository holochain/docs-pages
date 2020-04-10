#![feature(proc_macro_hygiene)]

use hdk::prelude::*;
use hdk_proc_macros::zome;

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
    #[zome_fn("hc_public")]
    pub fn hello_holo() -> ZomeApiResult<String> {
        Ok("Hello Holo".into())
    }
}
