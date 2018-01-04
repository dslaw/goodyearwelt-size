# goodyearwelt-sizes

Display manufacturer last sizes from /r/goodyearwelt.


## Running

Build and run the application locally using Docker:

```
docker build --tag gyw-sizes .
docker run -p 3030:3030 -d gyw-sizes
```

Navigate to `http://localhost:3030/` for the site. Alternatively, sizing data,
as JSON, can be gotten from `http://localhost:3030/sizing`.
