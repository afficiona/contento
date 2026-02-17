#!/bin/bash
# Start all backend and frontend services

echo "Starting all platforms..."
echo ""

# Function to start a service in the background
start_service() {
  local dir=$1
  local name=$2
  echo "Starting $name..."
  cd "$dir" && npm run dev > "/tmp/$name.log" 2>&1 &
  cd - > /dev/null
}

# Start backends
start_service "Manch/backend" "manch-backend"
start_service "Adda/backend" "adda-backend"
start_service "Samooh/backend" "samooh-backend"
start_service "Prasaran/backend" "prasaran-backend"

echo ""
echo "Waiting for backends to initialize..."
sleep 5
echo ""

# Start frontends
start_service "Manch/frontend" "manch-frontend"
start_service "Adda/frontend" "adda-frontend"
start_service "Samooh/frontend" "samooh-frontend"
start_service "Prasaran/frontend" "prasaran-frontend"

echo ""
echo "✅ All services started!"
echo ""
echo "Platform URLs:"
echo "  - Manch: http://localhost:3002 (API: http://localhost:3000)"
echo "  - Adda: http://localhost:3102 (API: http://localhost:3100)"
echo "  - Samooh: http://localhost:3202 (API: http://localhost:3200)"
echo "  - Prasaran: http://localhost:3003 (API: http://localhost:3001)"
echo ""
echo "Logs are in /tmp/*.log"
echo "Press Ctrl+C to stop all services (run ./stop-all.sh to clean up)"
echo ""

# Keep script running
wait
