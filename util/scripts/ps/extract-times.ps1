param (
  [string]$jsonFilePath
)

if (Test-Path -Path $jsonFilePath) {
  $jsonContent = Get-Content -Path $jsonFilePath -Raw -Encoding UTF8
  $psObject = ConvertFrom-Json -InputObject $jsonContent
  $words = $psObject.word_segments
  $csv = "" 
  for ($idx = 0; $idx -lt $words.Length - 1; $idx++) {
    $word = $words[$idx]
    $quietTime = $words[$idx + 1].start - $word.end
    $endTime = $word.end + ($quietTime * 1 / 5)
    if ($csv -eq "") {
      $csv = "$endTime"
    }
    else {
      $csv = "$csv,$endTime"
    }
  }
  $filePath = $jsonFilePath -replace '\.json$', '.txt'
  Set-Content -Path $filePath -Value $csv
}
else {
  Write-Error "File not found: $jsonFilePath"
}
