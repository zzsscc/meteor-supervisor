set MONGO_URL=mongodb://127.0.0.1:27017/jianli
set ROOT_URL=http://127.0.0.1
set PORT=4000
set METEOR_SETTINGS={"logentries":{"token":"e63de046-49c6-4d61-a63d-874cf671469c"},"kadira":{"debug":{"authKey":"sa"}}}
set KADIRA_PROFILE_LOCALLY=1
cd D:/var/jianliweb/
node debug bundle/main.js

"D:\Program Files\node profiler\node-profiler.exe" bundle/main.js
