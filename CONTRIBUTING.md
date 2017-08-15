# Contributing to Socializa

## Found a bug?

If you find a bug you can help us by [submitting an issue](#submit-issue) to our [GitHub Repository](https://github.com/wadobo/socializa/). Even better, you can [submit a Pull Request](#submit-pr) with a fix.

## <a name="submit-issue"></a> Submitting an Issue

Before you submit an issue, please search the issue tracker, maybe an issue for your problem already
exists and the discussion might inform you of workarounds readily available.

We want to fix all the issues as soon as possible, but before fixing a bug we need to reproduce and
confirm it. In order to reproduce bugs we will systematically ask you to provide a minimal
reproduction scenario. Also we need additional questions like:

* Issue in Socializa
    * Version Socializa in app store or play store
    * Android or iOS version

* Issue in Socializa Editor
    * Version of Socializa Editor
    * Browser and your version

## <a name="submit-pr"></a> Submitting a Pull Request (PR)

Before you submit your Pull Request (PR) consider the following guidelines:

* Search [GitHub](https://github.com/wadobo/socializa/pulls) for an open or closed PR
  that relates to your submission. You don't want to duplicate effort.
* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```
* Create your patch, **including appropriate test cases**, it would be wonderful.
* [Run Socializa test](#run-test) if the change is in the backend and ensure that all tests pass.
* Commit your changes using a descriptive commit message.
* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```
* In GitHub, send a pull request to `socializa:dev`.

That's it! Thank you for your contribution!
