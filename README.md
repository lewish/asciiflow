## NOT MAINTAINED


ASCIIFlow is a client-side only web based application for drawing ASCII diagrams. You can use it at [asciiflow.com](https://asciiflow.com).

## Contributing
### Installation

ASCIIFlow is built with [Bazel](https://docs.bazel.build/versions/4.0.0/getting-started.html).
Bazel is most easily installed to the correct version through [Bazelisk](https://github.com/bazelbuild/bazelisk). See `.bazelversion` for the correct version if you aren't using Bazelisk.

```
npm install -g @bazel/bazelisk
yarn global add @bazel/bazelisk
```

For development, ibazel is also a very useful tool to help with automatic rebuilding and reloading.

```
npm install -g @bazel/ibazel
yarn global add @bazel/ibazel
```


### Running ASCIIFlow locally

After installation of Bazel/Bazelisk, you can run ASCIIFlow locally with:

```
ibazel run client:devserver
```

Or without ibazel (won't do live reloading):

```
bazel run client:devserver
```
