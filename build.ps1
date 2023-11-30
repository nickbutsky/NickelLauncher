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
    if (-not (Test-Path "UninsIS.dll")) {
        $tempFolder = [System.IO.Path]::GetTempPath() + [System.IO.Path]::GetRandomFileName()
        New-Item -ItemType Directory -Path $tempFolder
        Invoke-WebRequest -Uri "https://github.com/Bill-Stewart/UninsIS/releases/download/v1.0.1/UninsIS-1.0.1.zip" -OutFile "$tempFolder\UninsIS-1.0.1.zip"
        Expand-Archive -Path "$tempFolder\UninsIS-1.0.1.zip" -DestinationPath $tempFolder
        Move-Item -Path "$tempFolder\UninsIS.dll" -Destination (Get-Location).Path
        Remove-Item -Path $tempFolder -Recurse
    }

    Invoke-Expression "&'$isccPath' /DAppName=$( $appConfig.'name' ) /DAppPublisher=$( $appConfig.'publisher' ) /DAppVersion=$( $appConfig.'version' ) /DAppURL=$( $appConfig.'url' ) installer_config.iss"
}