""" 
A no-op test that always passes, forcing certain things to build when using --build_tests_only.
"""

def build_test(name, deps):
    native.sh_test(name = name, data = deps, srcs = ["//testing:build_test.sh"])
