#!/bin/bash
cd /home/kavia/workspace/code-generation/event-booking-system-37142-37152/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

