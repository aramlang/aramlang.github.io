param (
    [Parameter(Mandatory = $true)]
    [ValidateSet("Bereshit", "Shemot", "Vayikra", "Bemidbar", "Devarim", 
        "Yehoshua", "Shoftim", "Rut", "Shmuel-Aleph", "Shmuel-Bet",
        "Melakhim-Aleph", "Melakhim-Bet", "Divrei-Hayamim-Aleph", "Divrei-Hayamim-Bet",
        "Ezra", "Nekhemiah", "Ester", "Iyov", "Tehillim",
        "Mishlei", "Kohelet", "Shir-Hashirim", "Yeshayahu", "Yirmeyahu",
        "Eikhah", "Yekhezkel", "Daniel", "Hoshea", "Yoel", "Amos",
        "Ovadyah", "Yonah", "Mikhah", "Nakhum", "Khavakuk",
        "Tzefanyah", "Khaggai", "Zekhariah", "Malakhi", "Mattai",
        "Marqus", "Luqa", "Yukhanan", "Acts")]
    [string]$book,

    [Parameter(Mandatory = $true)]
    [ValidateRange(1, 150)]
    [int]$chapter
)

$bible = @{
    # Torah
    "Bereshit"             = @{
        "no"       = "01"
        "chapters" = 50
        "pad"      = 3
    }
    "Shemot"               = @{
        "no"       = "02"
        "chapters" = 40
        "pad"      = 3
    }
    "Vayikra"              = @{
        "no"       = "03"
        "chapters" = 27
        "pad"      = 3
    }
    "Bemidbar"             = @{
        "no"       = "04"
        "chapters" = 36
        "pad"      = 3
    } 
    "Devarim"              = @{
        "no"       = "05"
        "chapters" = 34
        "pad"      = 3
    }
    
    # Nevi'im
    "Yehoshua"             = @{
        "no"       = "06"
        "chapters" = 24
        "pad"      = 3
    }
    "Shoftim"              = @{
        "no"       = "07"
        "chapters" = 21
        "pad"      = 3
    }
    "Shmuel-Aleph"         = @{
        "no"       = "08"
        "chapters" = 30
        "pad"      = 3
    }
    "Shmuel-Bet"           = @{
        "no"       = "09"
        "chapters" = 24
        "pad"      = 3
    }
    "Melakhim-Aleph"       = @{
        "no"       = "10"
        "chapters" = 22
        "pad"      = 3
    }
    "Melakhim-Bet"         = @{
        "no"       = "11"
        "chapters" = 25
        "pad"      = 3
    }
    "Yeshayahu"            = @{
        "no"       = "12"
        "chapters" = 60
        "pad"      = 3
    }
    "Yirmeyahu"            = @{
        "no"       = "13"
        "chapters" = 50
        "pad"      = 3
    }
    "Yekhezkel"            = @{
        "no"       = "14"
        "chapters" = 48
        "pad"      = 3
    }
    "Hoshea"               = @{
        "no"       = "15"
        "chapters" = 14
        "pad"      = 3
    }
    "Yoel"                 = @{
        "no"       = "16"
        "chapters" = 4
        "pad"      = 3
    }
    "Amos"                 = @{
        "no"       = "17"
        "chapters" = 9
        "pad"      = 3
    }
    "Ovadyah"              = @{
        "no"       = "18"
        "chapters" = 1
        "pad"      = 3
    }
    "Yonah"                = @{
        "no"       = "19"
        "chapters" = 4
        "pad"      = 3
    }
    "Mikhah"               = @{
        "no"       = "20"
        "chapters" = 7
        "pad"      = 3
    }
    "Nakhum"               = @{
        "no"       = "21"
        "chapters" = 3
        "pad"      = 3
    }
    "Khavakuk"             = @{
        "no"       = "22"
        "chapters" = 3
        "pad"      = 3
    }
    "Tzefanyah"            = @{
        "no"       = "23"
        "chapters" = 3
        "pad"      = 3
    }
    "Khaggai"              = @{
        "no"       = "24"
        "chapters" = 2
        "pad"      = 3
    }
    "Zekhariah"            = @{
        "no"       = "25"
        "chapters" = 14
        "pad"      = 3
    }
    "Malakhi"              = @{
        "no"       = "26"
        "chapters" = 3
        "pad"      = 3
    }
    
    # Ketuvim
    "Tehillim"             = @{
        "no"       = "27"
        "chapters" = 150
        "pad"      = 3
    }
    "Mishlei"              = @{
        "no"       = "28"
        "chapters" = 31
        "pad"      = 3
    }
    "Iyov"                 = @{
        "no"       = "29"
        "chapters" = 42
        "pad"      = 3
    }
    "Shir-Hashirim"        = @{
        "no"       = "30"
        "chapters" = 8
        "pad"      = 3
    }
    "Rut"                  = @{
        "no"       = "31"
        "chapters" = 4
        "pad"      = 3
    }
    "Eikhah"               = @{
        "no"       = "32"
        "chapters" = 5
        "pad"      = 3
    }
    "Kohelet"              = @{
        "no"       = "33"
        "chapters" = 12
        "pad"      = 3
    }
    "Ester"                = @{
        "no"       = "34"
        "chapters" = 10
        "pad"      = 3
    } 
    "Daniel"               = @{
        "no"       = "35"
        "chapters" = 12
        "pad"      = 3
    }
    "Ezra"                 = @{
        "no"       = "36"
        "chapters" = 10
        "pad"      = 3
    } 
    "Nekhemiah"            = @{
        "no"       = "37"
        "chapters" = 13
        "pad"      = 3
    }
    "Divrei-Hayamim-Aleph" = @{
        "no"       = "38"
        "chapters" = 29
        "pad"      = 3
    }
    "Divrei-Hayamim-Bet"   = @{
        "no"       = "39"
        "chapters" = 36
        "pad"      = 3
    }
    
    # Gospels
    "Mattai"               = @{
        "no"       = "01"
        "chapters" = 28
        "pad"      = 2
    }
    "Marqus"               = @{
        "no"       = "02"
        "chapters" = 16
        "pad"      = 2
    }
    "Luqa"                 = @{
        "no"       = "03"
        "chapters" = 24
        "pad"      = 2
    }
    "Yukhanan"             = @{
        "no"       = "04"
        "chapters" = 21
        "pad"      = 2
    } 
    "Acts"                 = @{
        "no"       = "05"
        "chapters" = 28
        "pad"      = 2
    }
}
     
$bookNfo = $bible[$book]
$bookNo = $bookNfo["no"]
$chapters = $bookNfo["chapters"]
$pad = $bookNfo["pad"]

if ($chapter -lt 1 -or $chapter -gt $chapters) {
    $errorMsg = "`n$book ($bookNo) has only $chapters chapters. Chapter $chapter is invalid!"
    Write-Host $errorMsg
    exit 1
}
    
$paddedChapter = $chapter.ToString().PadLeft($pad, '0')
$workChapter = "${bookNo}_${book}_$paddedChapter"
$cd = Get-Location
$workPath = Join-Path -Path $cd $workChapter

if (-not (Test-Path -Path $workPath -PathType Container)) {
    $errorMsg = "`nFolder $workPath does not exists. Folder must exists for setup to complete."
    Write-Host $errorMsg
    exit 1
}

$wavFile = Join-Path $workPath "$workChapter.wav"
if (-not (Test-Path -Path $wavFile -PathType Leaf)) {
    $errorMsg = "`nAudio $wavFile does not exists. Chapter audio wav file must exists for setup to complete."
    Write-Host $errorMsg
    exit 1
}
