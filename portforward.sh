#!/bin/bash

export pod=$1
export port=$2
sudo iptables -t nat -A PREROUTING -p tcp --dport 8545 -j DNAT --to-destination 127.0.0.1:$port

kubectl port-forward $(kubectl get pod -n $pod | grep geth-miner | awk '{print $1}') -n $pod $port:8545
