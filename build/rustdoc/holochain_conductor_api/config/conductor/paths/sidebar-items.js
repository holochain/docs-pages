initSidebarItems({"fn":[["config_root","Returns the path to the root config directory for all of Holochain. If we can get a user directory it will be an XDG compliant path like \"/home/peter/.config/holochain\". If it can't get a user directory it will default to \"/etc/holochain\"."],["data_root","Returns the path to the root data directory for all of Holochain. If we can get a user directory it will be an XDG compliant path like \"/home/peter/.local/share/holochain\". If it can't get a user directory it will default to \"/etc/holochain\"."],["keys_directory","Returns the path to where agent keys are stored and looked for by default. Something like \"~/.config/holochain/keys\"."]],"struct":[["ConfigFilePath","Newtype for the Conductor Config file path. Has a Default."],["EnvironmentRootPath","Newtype for the LMDB environment path. Has a Default."]]});