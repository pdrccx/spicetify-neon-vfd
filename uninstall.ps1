# Quita NEON//VFD y regresa el tema que tenías antes (guardado por install.ps1).
# Ojo: "spicetify apply" reinicia Spotify.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

$config = Join-Path $env:APPDATA 'spicetify\config-xpui.ini'
$prev = if (Test-Path '.previous-theme') { Get-Content '.previous-theme' -Raw | ConvertFrom-Json } else { $null }
$theme = if ($prev -and $prev.theme) { $prev.theme } else { 'marketplace' }
$scheme = if ($prev) { $prev.scheme } else { '' }

spicetify config current_theme $theme

# PowerShell 5.1 no le pasa un texto vacío a programas externos, así que un
# esquema vacío se escribe directo en el archivo de configuración.
if ([string]::IsNullOrEmpty($scheme)) {
  $text = Get-Content $config -Raw
  $text = $text -replace '(?m)^(color_scheme\s*=).*$', '$1 '
  [IO.File]::WriteAllText($config, $text)
} else {
  spicetify config color_scheme $scheme
}

spicetify apply
Write-Host "Listo: tema '$theme' restaurado. La carpeta Themes\NeonVFD se queda por si lo quieres volver a poner."
