#!/bin/sh
ps aux | grep Fabulou | grep [n]ode  | awk '{print $3}' | xargs kill -14
