# ASCIIFlow Infinity

## Dockerized Setup

The easiest way to get AsciiFlow running locally is with a recent version of Docker.

```
make
```

Then open your browser to the url that it outputs.

## Manual Setup

Compile the JavaScript (requires Java):
~/asciiflow2$ ./compile.sh

If you get a permissions error:
~/asciiflow2$ chmod a+x closure-compiler.jar

### Run a simple web server in Python 3:


```python
~/asciiflow2$ python2 -m http.server
```

Goto: http://localhost:8000/index.html

When developing, use the Google JS linter, gjslint.
