$baseUrl = "http://localhost:8080/api"

Write-Host "Registering a test SELLER..."
$signupBody = @{
    username = "test_seller2"
    email = "test_seller2@example.com"
    password = "SecurePassword1!"
    role = "ROLE_SELLER"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/auth/signup" -Method Post -Body $signupBody -ContentType "application/json" -ErrorAction SilentlyContinue | Out-Null

Write-Host "Logging in to get JWT token..."
$loginBody = @{
    username = "test_seller2"
    password = "SecurePassword1!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/signin" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Adding dummy pet listings..."

$pet1 = @{
    name = "Buddy"
    breed = "Golden Retriever"
    age = 5
    price = 1200.00
    category = "DOG"
    description = "A very friendly Golden Retriever who loves to play fetch and go for long walks. Great with kids and other pets. Vaccinations are up to date."
    imageUrl = "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=800&auto=format&fit=crop"
} | ConvertTo-Json

$pet2 = @{
    name = "Luna"
    breed = "Siamese"
    age = 12
    price = 650.00
    category = "CAT"
    description = "Beautiful Siamese cat with striking blue eyes. Very vocal, playful, and affectionate. Fully trained to use the litter box."
    imageUrl = "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?q=80&w=800&auto=format&fit=crop"
} | ConvertTo-Json

$pet3 = @{
    name = "Charlie"
    breed = "Beagle"
    age = 24
    price = 850.50
    category = "DOG"
    description = "Energetic Beagle looking for an active family. Charlie loves sniffing around the yard and playing hide and seek with his favorite toys."
    imageUrl = "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?q=80&w=800&auto=format&fit=crop"
} | ConvertTo-Json

$pet4 = @{
    name = "Nibbles"
    breed = "Holland Lop"
    age = 3
    price = 85.00
    category = "RABBIT"
    description = "Adorable tiny Holland Lop bunny. Very gentle and loves fresh carrots and lettuce. Perfect for apartment living."
    imageUrl = "https://images.unsplash.com/photo-1585110396000-c9eae4986198?q=80&w=800&auto=format&fit=crop"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/pets" -Method Post -Headers $headers -Body $pet1 | Out-Null
Invoke-RestMethod -Uri "$baseUrl/pets" -Method Post -Headers $headers -Body $pet2 | Out-Null
Invoke-RestMethod -Uri "$baseUrl/pets" -Method Post -Headers $headers -Body $pet3 | Out-Null
Invoke-RestMethod -Uri "$baseUrl/pets" -Method Post -Headers $headers -Body $pet4 | Out-Null

Write-Host "Successfully generated 4 fake pet listings in the database!"
