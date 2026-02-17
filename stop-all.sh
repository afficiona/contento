#!/bin/bash
# Stop all running services

echo "Stopping all platforms..."

# Kill processes on known ports
ports=(3000 3001 3002 3003 3100 3102 3200 3202)

for port in "${ports[@]}"; do
  echo "Stopping services on port $port..."
  lsof -ti:$port | xargs kill -9 2>/dev/null
done

echo ""
echo "✅ All services stopped!"
echo ""

# Clean up log files
echo "Cleaning up log files..."
rm -f /tmp/manch-backend.log
rm -f /tmp/manch-frontend.log
rm -f /tmp/adda-backend.log
rm -f /tmp/adda-frontend.log
rm -f /tmp/samooh-backend.log
rm -f /tmp/samooh-frontend.log
rm -f /tmp/prasaran-backend.log
rm -f /tmp/prasaran-frontend.log

echo "✅ Cleanup complete!"
