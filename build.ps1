param([string]$isccPath)

$appConfig = ConvertFrom-Json -InputObject (Get-Content -Path "app_config.json" -Raw)
$nuitkaConfig = ConvertFrom-Json -InputObject (python -c "import json, json_ref_dict; print(json.dumps(json_ref_dict.materialize(json_ref_dict.RefDict('nuitka_config.json'))))")

$scriptPath = $nuitkaConfig."script-path"
$arguments = ($nuitkaConfig.arguments.PSObject.Properties | ForEach-Object {"--$($_.Name)=$($_.Value)"}) -join " "
$flags = "--$($nuitkaConfig.flags -join " --")"

if (Test-Path "dist") { Remove-Item "dist" -Recurse }

Invoke-Expression "nuitka $arguments $flags $scriptPath"

Rename-Item -Path "dist\$([System.IO.Path]::GetFileNameWithoutExtension($scriptPath)).dist" -NewName $appConfig."name"

if ($PSBoundParameters.ContainsKey('isccPath')) {
    Invoke-Expression "&'$isccPath' /DAppName=$( $appConfig.'name' ) /DAppPublisher=$( $appConfig.'publisher' ) /DAppVersion=$( $appConfig.'version' ) /DAppURL=$( $appConfig.'url' ) installer_config.iss"
}