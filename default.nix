let
 holonix-release-tag = "0.0.1";
 holonix-release-sha256 = "1mhrp677p45ihajnjanav7cjvfhb2qn4g262vr06wy1zkj20mm0g";

 holonix = import (fetchTarball {
  url = "https://github.com/holochain/holonix/tarball/${holonix-release-tag}";
  sha256 = "${holonix-release-sha256}";
 });
 # holonix = import ../holonix;

 docs-serve = holonix.pkgs.writeShellScriptBin "docs-serve" "jekyll serve";
in
with holonix.pkgs;
{
 core-shell = stdenv.mkDerivation (holonix.shell // {
  name = "docs-pages-shell";

  buildInputs = [
   jekyll
   docs-serve
  ]
   ++ holonix.shell.buildInputs
  ;
 });
}
