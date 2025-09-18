#!/bin/bash

echo "🧪 Test du backend Ophrus-Immo"
echo "================================"

# Variables
BASE_URL="http://localhost:5000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="MotDePasse123!"

echo "1. Test de santé..."
curl -s $BASE_URL/health | jq './jq.exe'

echo -e "\n2. Test de la route racine..."
curl -s $BASE_URL/

echo -e "\n3. Test d'inscription (envoi d'e-mail)..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d "{
    \"nom\": \"Test User\",
    \"email\": \"$TEST_EMAIL\",
    \"telephone\": \"+33123456789\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo $REGISTER_RESPONSE | jq '.'

echo -e "\n4. Test de connexion..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo $LOGIN_RESPONSE | jq '.'

# Extraire le token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')

if [ ! -z "$TOKEN" ]; then
  echo -e "\n5. Test du profil utilisateur..."
  curl -s -X GET $BASE_URL/api/users/profil \
    -H "Authorization: Bearer $TOKEN" | jq '.'
fi

echo -e "\n6. Test de réinitialisation de mot de passe (envoi d'e-mail)..."
curl -s -X POST $BASE_URL/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\"
  }" | jq '.'

echo -e "\n✅ Tests terminés!"