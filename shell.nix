let
 nixpkgs = import <nixpkgs> {};

 docs-serve = nixpkgs.writeShellScriptBin "docs-serve" "python -m SimpleHTTPServer";
in
with nixpkgs;
stdenv.mkDerivation rec {
 name = "holochain-docs";

 buildInputs = [
  python27Full

  docs-serve
 ];
}
