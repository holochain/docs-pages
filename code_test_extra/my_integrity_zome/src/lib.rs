use hdi::{hdk_extern, map_extern};
use hdi::prelude::{ExternResult, ValidateCallbackResult, Op};

#[hdk_extern]
pub fn validate(_: Op) -> ExternResult<ValidateCallbackResult> {
    Ok(ValidateCallbackResult::Valid)
}