(function() {var implementors = {};
implementors["serde"] = [];
implementors["serde_bytes"] = [{text:"impl&lt;'de, 'a, E&gt; <a class=\"trait\" href=\"serde/de/trait.IntoDeserializer.html\" title=\"trait serde::de::IntoDeserializer\">IntoDeserializer</a>&lt;'de, E&gt; for <a class=\"struct\" href=\"serde_bytes/struct.Bytes.html\" title=\"struct serde_bytes::Bytes\">Bytes</a>&lt;'a&gt; <span class=\"where fmt-newline\">where<br>&nbsp;&nbsp;&nbsp;&nbsp;E: <a class=\"trait\" href=\"serde/de/trait.Error.html\" title=\"trait serde::de::Error\">Error</a>,&nbsp;</span>",synthetic:false,types:["serde_bytes::Bytes"]},{text:"impl&lt;'de, E&gt; <a class=\"trait\" href=\"serde/de/trait.IntoDeserializer.html\" title=\"trait serde::de::IntoDeserializer\">IntoDeserializer</a>&lt;'de, E&gt; for <a class=\"struct\" href=\"serde_bytes/struct.ByteBuf.html\" title=\"struct serde_bytes::ByteBuf\">ByteBuf</a> <span class=\"where fmt-newline\">where<br>&nbsp;&nbsp;&nbsp;&nbsp;E: <a class=\"trait\" href=\"serde/de/trait.Error.html\" title=\"trait serde::de::Error\">Error</a>,&nbsp;</span>",synthetic:false,types:["serde_bytes::bytebuf::ByteBuf"]},];
implementors["toml"] = [{text:"impl&lt;'de&gt; <a class=\"trait\" href=\"serde/de/trait.IntoDeserializer.html\" title=\"trait serde::de::IntoDeserializer\">IntoDeserializer</a>&lt;'de, <a class=\"struct\" href=\"toml/de/struct.Error.html\" title=\"struct toml::de::Error\">Error</a>&gt; for <a class=\"enum\" href=\"toml/value/enum.Value.html\" title=\"enum toml::value::Value\">Value</a>",synthetic:false,types:["toml::value::Value"]},];

            if (window.register_implementors) {
                window.register_implementors(implementors);
            } else {
                window.pending_implementors = implementors;
            }
        
})()
