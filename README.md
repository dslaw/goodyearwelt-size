# goodyearwelt-sizes

Display manufacturer last sizes from /r/goodyearwelt.


## Running

Build and run the application locally using Docker:

```
docker build --tag gyw-sizes .
docker run -p 3030:3030 -d gyw-sizes
```

Sizing data, as JSON, can then be gotten from `http://localhost:3000/sizing`.
