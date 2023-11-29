$nuitkaConfig = ConvertFrom-Json -InputObject (python -c "import json, json_ref_dict; print(json.dumps(json_ref_dict.materialize(json_ref_dict.RefDict('nuitka_config.json'))))")

$scriptPath = $nuitkaConfig."script-path"
$arguments = ($nuitkaConfig.arguments.PSObject.Properties | ForEach-Object {"--$($_.Name)=$($_.Value)"}) -join " "
$flags = "--$($nuitkaConfig.flags -join " --")"

if (Test-Path "dist") { Remove-Item "dist" -Recurse }

Invoke-Expression "nuitka $arguments $flags $scriptPath"

$outputPath = "$($nuitkaConfig."arguments"."output-dir")\$([System.IO.Path]::GetFileNameWithoutExtension($scriptPath)).dist"
$scriptParentDirectoryName = (Split-Path $scriptPath -Parent) | Split-Path -Leaf

Rename-Item -Path $outputPath -NewName $scriptParentDirectoryName