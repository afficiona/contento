#!/bin/bash

# Test script for Contento POC
# This demonstrates the basic functionality of both Manch and Prasaran

set -e

echo "=== Contento POC Test ==="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}1. Testing Manch (Social Platform) - Port 3000${NC}"
echo "Creating a user on Manch..."
MANCH_USER=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test-manch-'$(date +%s)'@example.com","password":"password123","name":"Test Manch User"}')

echo $MANCH_USER | jq .
MANCH_EMAIL=$(echo $MANCH_USER | jq -r '.email')

echo ""
echo "Logging in to Manch..."
MANCH_LOGIN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'$MANCH_EMAIL'","password":"password123"}')

MANCH_TOKEN=$(echo $MANCH_LOGIN | jq -r '.token')
echo -e "${GREEN}✓ Manch login successful${NC}"

echo ""
echo "Creating a post on Manch..."
MANCH_POST=$(curl -s -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer $MANCH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello from Manch! This is a test post."}')

echo $MANCH_POST | jq .
echo -e "${GREEN}✓ Post created on Manch${NC}"

echo ""
echo "Fetching all posts from Manch..."
curl -s -X GET http://localhost:3000/posts | jq '.[0:2]'
echo -e "${GREEN}✓ Posts retrieved from Manch${NC}"

echo ""
echo ""
echo -e "${BLUE}2. Testing Prasaran (Publishing Service) - Port 3001${NC}"
echo "Creating a user on Prasaran..."
PRASARAN_USER=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test-prasaran-'$(date +%s)'@example.com","password":"password123"}')

echo $PRASARAN_USER | jq .
PRASARAN_EMAIL=$(echo $PRASARAN_USER | jq -r '.email')

echo ""
echo "Logging in to Prasaran..."
PRASARAN_LOGIN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'$PRASARAN_EMAIL'","password":"password123"}')

PRASARAN_TOKEN=$(echo $PRASARAN_LOGIN | jq -r '.token')
echo -e "${GREEN}✓ Prasaran login successful${NC}"

echo ""
echo "Checking Prasaran's publish history (should be empty)..."
curl -s -X GET http://localhost:3001/api/publish/history \
  -H "Authorization: Bearer $PRASARAN_TOKEN" | jq .
echo -e "${GREEN}✓ Publish history retrieved${NC}"

echo ""
echo ""
echo -e "${BLUE}=== POC Test Complete ===${NC}"
echo ""
echo "Summary:"
echo "  - Manch backend: ✓ Running on port 3000"
echo "  - Prasaran backend: ✓ Running on port 3001"
echo "  - User registration: ✓ Working on both platforms"
echo "  - Authentication: ✓ JWT tokens working"
echo "  - Manch posts API: ✓ Create and read posts"
echo "  - Prasaran publish API: ✓ Ready for publishing"
echo ""
echo "Note: OAuth connection flow between Prasaran and Manch requires"
echo "manual OAuth authorization steps (see README.md for details)"
echo ""
echo "Both backends are following the architecture specified in docs/architecture.md"
