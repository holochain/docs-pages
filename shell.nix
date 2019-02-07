let
 nixpkgs = import <nixpkgs> {};

 docs-serve = nixpkgs.writeShellScriptBin "docs-serve" "jekyll serve";
in
with nixpkgs;
stdenv.mkDerivation rec {
 name = "holochain-docs";

 buildInputs = [
  jekyll

  docs-serve
 ];
}
