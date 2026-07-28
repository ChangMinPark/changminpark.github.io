---
  layout: null
sitemap:
exclude: 'yes'
---

  $(document).ready(function () {
    {% if site.disable_landing_page != true %}
    function collapsePanel(animateDesktop) {
      var $panel = $('.panel-cover')
      if ($panel.hasClass('panel-cover--collapsed')) return

      var currentWidth = $panel.width()
      if (currentWidth < 960) {
        $panel.addClass('panel-cover--collapsed')
        $('.content-wrapper').addClass('animated slideInRight')
        return
      }

      if (animateDesktop) {
        $panel.css('max-width', currentWidth)
        $panel.animate({ 'max-width': '450px', 'width': '40%' }, 400, 'swing', function () {
          $panel.addClass('panel-cover--collapsed')
          // Let CSS own collapsed layout (avoids stale inline widths on next nav).
          $panel.css({ 'max-width': '', 'width': '' })
        })
      } else {
        $panel.addClass('panel-cover--collapsed')
      }
    }

    $('a.blog-button').click(function (e) {
      collapsePanel(true)
    })

    var hash = window.location.hash
    if (hash === '#about' || hash === '#writing' || hash === '#blog') {
      collapsePanel(false)
    }

    var path = window.location.pathname.replace(/\/index\.html$/, '/')
    if (path !== '{{ site.baseurl }}/' && path !== '/') {
      collapsePanel(false)
    }
    {% endif %}

    $('.btn-mobile-menu').click(function () {
      $('.navigation-wrapper').toggleClass('visible animated bounceInDown')
      $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
    })

    $('.navigation-wrapper .blog-button').click(function () {
      $('.navigation-wrapper').toggleClass('visible')
      $('.btn-mobile-menu__icon').toggleClass('icon-list icon-x-circle animated fadeIn')
    })

  })
