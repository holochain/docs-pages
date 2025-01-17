use hdk::prelude::*;

#[hdk_extern]
pub fn say_hello(name: String) -> ExternResult<String> {
    Ok(format!("Hello {}!", name))
}

#[hdk_extern]
pub fn get_any_record(hash: AnyDhtHash) -> ExternResult<Option<Record>> {
    // Short-circuit any error that `get` might return.
    let maybe_record = get(hash, GetOptions::network())?;
    Ok(maybe_record)
}

#[hdk_extern]
pub fn check_age_for_18a_movie(age: u32) -> ExternResult<()> {
    if age >= 18 {
        return Ok(());
    }
    Err(wasm_error!("You are too young to watch this movie."))
}
