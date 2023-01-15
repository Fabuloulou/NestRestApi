#!/bin/sh
ps aux | grep Fabulou | grep [n]ode  | awk '{print $2}' | xargs kill -14
