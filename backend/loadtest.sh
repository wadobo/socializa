#! /bin/bash
echo "ADVISE: When run loadtest, deactivate silk"
# Explanation:
#   -c Number of clients
#   -r Create clients in seconds
#   -n Number of request

# --only-summary

locust --no-web -c 100 -r 3 -n 1000  Index # aprox X req/s
locust --no-web -c 100 -r 3 -n 1000 Connections # aprox X req/s
