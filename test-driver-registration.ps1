# PowerShell script to test driver registration
Write-Host "=== Testing Driver Registration ===" -ForegroundColor Cyan

# Test 1: Valid registration
Write-Host "`n[Test 1] Valid driver registration" -ForegroundColor Yellow
$body1 = @{
    name = "Test Driver"
    email = "testdriver$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    phone = "+923001234567"
    password = "Test1234"
    role = "driver"
    driverInfo = @{
        licenseNumber = "DL123456"
        ambulanceNumber = "AMB789"
        status = "offline"
    }
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "http://localhost:5001/api/v1/auth/register" `
        -Method POST `
        -Body $body1 `
        -ContentType "application/json" `
        -UseBasicParsing
    Write-Host "✅ Status: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response1.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Missing licenseNumber
Write-Host "`n[Test 2] Missing licenseNumber" -ForegroundColor Yellow
$body2 = @{
    name = "Test Driver 2"
    email = "testdriver2$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    phone = "+923001234568"
    password = "Test1234"
    role = "driver"
    driverInfo = @{
        ambulanceNumber = "AMB790"
        status = "offline"
    }
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "http://localhost:5001/api/v1/auth/register" `
        -Method POST `
        -Body $body2 `
        -ContentType "application/json" `
        -UseBasicParsing
    Write-Host "Status: $($response2.StatusCode)" -ForegroundColor Yellow
    Write-Host "Response: $($response2.Content)" -ForegroundColor Yellow
} catch {
    Write-Host "Expected error (400):" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

# Test 3: Missing ambulanceNumber
Write-Host "`n[Test 3] Missing ambulanceNumber" -ForegroundColor Yellow
$body3 = @{
    name = "Test Driver 3"
    email = "testdriver3$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    phone = "+923001234569"
    password = "Test1234"
    role = "driver"
    driverInfo = @{
        licenseNumber = "DL123457"
        status = "offline"
    }
} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:5001/api/v1/auth/register" `
        -Method POST `
        -Body $body3 `
        -ContentType "application/json" `
        -UseBasicParsing
    Write-Host "Status: $($response3.StatusCode)" -ForegroundColor Yellow
    Write-Host "Response: $($response3.Content)" -ForegroundColor Yellow
} catch {
    Write-Host "Expected error (400):" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

# Test 4: Phone without country code
Write-Host "`n[Test 4] Phone without country code" -ForegroundColor Yellow
$body4 = @{
    name = "Test Driver 4"
    email = "testdriver4$(Get-Date -Format 'yyyyMMddHHmmss')@test.com"
    phone = "03001234567"
    password = "Test1234"
    role = "driver"
    driverInfo = @{
        licenseNumber = "DL123458"
        ambulanceNumber = "AMB792"
        status = "offline"
    }
} | ConvertTo-Json

try {
    $response4 = Invoke-WebRequest -Uri "http://localhost:5001/api/v1/auth/register" `
        -Method POST `
        -Body $body4 `
        -ContentType "application/json" `
        -UseBasicParsing
    Write-Host "Status: $($response4.StatusCode)" -ForegroundColor Yellow
    Write-Host "Response: $($response4.Content)" -ForegroundColor Yellow
} catch {
    Write-Host "Expected error (400):" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Tests Complete ===" -ForegroundColor Cyan
