python.exe -m pip install Nuitka==1.6.6

$config = ConvertFrom-Json -InputObject (Get-Content -Path "nuitka_config.json" -Raw)

$scriptPath = $config."script-path"

$arguments = ($config.arguments.PSObject.Properties | ForEach-Object {"--$($_.Name)=$($_.Value)"}) -join ' '

$flags = $config.flags -join ' --'
$flags = "--$flags"

Invoke-Expression "nuitka $arguments $flags $scriptPath"

$outputPath = "$($config."arguments"."output-dir")\$([System.IO.Path]::GetFileNameWithoutExtension($scriptPath)).dist"
$scriptParentDirectoryName = (Split-Path $scriptPath -Parent) | Split-Path -Leaf

Rename-Item -Path $outputPath -NewName $scriptParentDirectoryName