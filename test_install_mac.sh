#!/bin/bash
mkdir install_tests &&
single_source code src/install.md install_tests/mac.sh bash mac &&
single_source code src/install.md install_tests/windows.ps1 powershell &&
single_source code src/install.md install_tests/enter.sh bash enter &&
single_source code src/install.md install_tests/nix.sh bash nix &&
cd install_tests &&
printf '%s\n%s\n' "$(cat mac.sh)" "./enter.sh" >mac.sh &&
printf '%s %s\n' "$(cat enter.sh)" "--run ../check_install.sh" >enter.sh &&
sed -i -e '$ ! s/$/ \&\&/' mac.sh &&
sed -i -e '$ ! s/$/ \&\&/' nix.sh  &&
printf '%s\n%s\n' "#!/bin/bash" "$(cat mac.sh)" >mac.sh &&
printf '%s\n%s\n' "#!/bin/bash" "$(cat enter.sh)" >enter.sh &&
printf '%s\n%s\n' "#!/bin/bash" "$(cat nix.sh)" >nix.sh &&
chmod 755 mac.sh && 
chmod 755 enter.sh && 
chmod 755 nix.sh &&
./mac.sh
