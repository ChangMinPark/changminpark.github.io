# Personal Website
This repo has source files for Chang Min Park's personal website. - [Link](https://changminpark.github.io/)

Jekyll themes used:
- [Uno](https://github.com/joshgerdes/jekyll-uno) and [Chirpy](https://github.com/cotes2020/jekyll-theme-chirpy)


## Install and Test Locally

1. Download or clone repo `git clone git@github.com:joshgerdes/jekyll-uno.git`
2. Enter the folder: `cd jekyll-uno/`
3. If you don't have bundler installed: `gem install bundler`
3. Install Ruby gems: `bundle install`
4. Start Jekyll server: `bundle exec jekyll serve --watch`

Access via: [http://localhost:4000/jekyll-uno/](http://localhost:4000/jekyll-uno/)

If you would like to run without using the `github-pages` gem, update your Gemfile to the following:

```
source 'https://rubygems.org'
gem 'jekyll-paginate'
gem 'jekyll-watch'
gem 'kramdown'
gem 'kramdown-parser-gfm'
```
