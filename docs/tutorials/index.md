# Some documentation

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer tellus augue, ullamcorper id hendrerit vitae, pretium eu erat. Morbi id mattis tortor. Sed ac augue nisl. Nam euismod tortor auctor porttitor consequat. Suspendisse finibus risus massa, at semper risus luctus vitae. Duis eu fringilla lacus. In faucibus varius nisl volutpat varius. Vestibulum ligula lacus, ullamcorper sed viverra vel, blandit nec lacus. Duis nec lorem eget justo porta ornare. Mauris dignissim varius faucibus. In hac habitasse platea dictumst. Duis rhoncus nisl urna, sit amet facilisis lectus dapibus sed. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Quisque id massa vitae libero accumsan accumsan.
``` python
import tensorflow as tf
```
```rust
#[init]
fn init() {
    Ok(())
}
```
```
#[init]
fn init() {
    Ok(())
}
```

```rust
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct MyEntry {
    content: String,
}
#[zome]
mod my_zome {

    #[init]
    fn init() {
        Ok(())
    }

    #[entry_def]
     fn my_entry_def() -> ValidatingEntryType {
        entry!(
            name: "my_entry",
            description: "this is a same entry defintion",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },
            validation: | _validation_data: hdk::EntryValidationData<MyEntry>| {
                Ok(())
            }
        )
    }

    #[zome_fn("hc_public")]
    fn create_my_entry(entry: MyEntry) -> ZomeApiResult<Address> {
        let entry = Entry::App("my_entry".into(), entry.into());
        let address = hdk::commit_entry(&entry)?;
        Ok(address)
    }

    #[zome_fn("hc_public")]
    fn get_my_entry(address: Address) -> ZomeApiResult<Option<Entry>> {
        hdk::get_entry(&address)
    }

    #[zome_fn("hc_public")]
    fn hello_holo() -> ZomeApiResult<String> {
        Ok("Hello Holo".into())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

}

```

## Some more docs

Etiam a velit et erat vulputate sollicitudin. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Morbi ut turpis est. Vestibulum pharetra, augue eu lobortis dapibus, libero lectus semper lectus, non cursus erat tellus a lorem. Pellentesque in orci vel turpis tristique varius non a libero. Nullam quis pellentesque odio, ac consequat ipsum. Nam a nibh et tellus interdum sagittis ut eu magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce luctus tellus sed arcu maximus, ut aliquam turpis tristique. Duis ut sollicitudin tortor, ac rhoncus augue.

Nullam hendrerit imperdiet tincidunt. Nunc tincidunt tortor diam, vel tempor ipsum sagittis sit amet. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur nec accumsan dui. Phasellus rutrum mollis dui vitae convallis. Maecenas vel rhoncus ligula, condimentum pretium quam. Vestibulum molestie porttitor congue. Pellentesque posuere purus et nisi lacinia posuere. Praesent tortor eros, iaculis vel massa id, commodo pellentesque neque.

Mauris in turpis odio. Ut egestas purus elit, a malesuada ante eleifend in. Nam quis mollis leo. Nunc feugiat enim sed aliquam sagittis. Nunc eu nibh et nibh cursus tincidunt et et quam. Maecenas vitae risus vitae tellus suscipit faucibus non vitae erat. Morbi tristique eleifend augue, id condimentum nisi sagittis in.

## Even more docs

Vestibulum sollicitudin sem in orci dapibus, a accumsan dolor hendrerit. Ut varius est et ex euismod tempor. Nulla dignissim risus et metus faucibus, quis pulvinar elit semper. Aenean vestibulum nisi dignissim ligula dapibus eleifend. Nullam sollicitudin enim eu mi efficitur, vel suscipit augue euismod. Morbi eget rutrum erat. Proin non nunc nec leo tempus eleifend. Pellentesque nisl felis, consequat sit amet dolor ac, bibendum lobortis augue. Etiam sit amet nisi consectetur, congue neque a, pellentesque ligula. Curabitur quis velit felis. Aenean condimentum malesuada blandit. Vestibulum varius ultricies malesuada.
```
#[validate_agent]
pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
    Ok(())
}

```
