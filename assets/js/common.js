$(document).ready(function() {
  // add toggle functionality to abstract and bibtex buttons
  $('a.abstract').click(function() {
    $(this).parent().parent().find(".abstract.hidden").toggleClass('open');
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass('open');
  });
  $('a.bibtex').click(function() {
    $(this).parent().parent().find(".bibtex.hidden").toggleClass('open');
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass('open');
  });
  $('a').removeClass('waves-effect waves-light');

  // bootstrap-toc
  if($('#toc-sidebar').length){
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href  = "../css/jupyter.css";
  cssLink.rel   = "stylesheet";
  cssLink.type  = "text/css";

  let theme = localStorage.getItem("theme");
  if (theme == null || theme == "null") {
    const userPref = window.matchMedia;
    if (userPref && userPref("(prefers-color-scheme: dark)").matches) {
      theme = "dark";
    }
  }

  $('.jupyter-notebook-iframe-container iframe').each(function() {
    $(this).contents().find("head").append(cssLink);

    if (theme == "dark") {
      $(this).bind("load",function(){
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark"});
      });
    }
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $publicationContainers = $('.publications[data-publication-filters]');

  $publicationContainers.each(function() {
    const $container = $(this);
    const $emptyState = $container.find('.publication-filter-empty');
    const $toolbar = $container.find('.publication-filters').first();
    const $filterIndicator = prefersReducedMotion
      ? $()
      : $('<span>', {
        class: 'publication-filter-indicator',
        'aria-hidden': 'true',
      });
    let activeTopic = 'all';
    let filterIndicatorFrame = null;

    const normalizeTopic = function(value) {
      return (value || '').toString().trim().toLowerCase();
    };

    const getButtons = function() {
      return $toolbar.find('.publication-filter');
    };

    const getPublicationItems = function() {
      return $container.find('ol.bibliography > li');
    };

    const getTopicMetadata = function() {
      const topics = {};

      getPublicationItems().each(function() {
        const $item = $(this);
        const $chips = $item.find('.publication-topic-chip');

        if ($chips.length > 0) {
          $chips.each(function() {
            const $chip = $(this);
            const topic = normalizeTopic($chip.data('topic'));
            const label = $chip.text().trim();

            if (!topic) {
              return;
            }

            if (!topics[topic]) {
              topics[topic] = {
                count: 0,
                label: label || topic,
              };
            }

            topics[topic].count += 1;
          });

          return;
        }

        const topicsRaw = $item.find('.publication-row').first().data('topics') || '';
        topicsRaw
          .split('|')
          .map(normalizeTopic)
          .filter(Boolean)
          .forEach(function(topic) {
            if (!topics[topic]) {
              topics[topic] = {
                count: 0,
                label: topic,
              };
            }

            topics[topic].count += 1;
          });
      });

      return topics;
    };

    const createFilterButton = function(topic, label, count, isActive) {
      const buttonLabel = (label || topic || '').toString().trim();

      return $('<button>', {
        class: 'publication-filter' + (isActive ? ' is-active' : ''),
        type: 'button',
        'data-topic': topic,
        'data-label': buttonLabel,
        'aria-pressed': isActive ? 'true' : 'false',
        text: buttonLabel + ' (' + count + ')',
      });
    };

    const updateFilterIndicator = function() {
      filterIndicatorFrame = null;

      if ($filterIndicator.length === 0 || $toolbar.prop('hidden')) {
        return;
      }

      const activeButton = getButtons().filter('.is-active').get(0);
      if (!activeButton) {
        $filterIndicator.css('opacity', '0');
        return;
      }

      $filterIndicator.css({
        width: String(activeButton.offsetWidth) + 'px',
        height: String(activeButton.offsetHeight) + 'px',
        transform: 'translate3d(' + String(activeButton.offsetLeft) + 'px, ' + String(activeButton.offsetTop) + 'px, 0)',
        opacity: '1',
      });
    };

    const queueFilterIndicator = function() {
      if ($filterIndicator.length === 0 || filterIndicatorFrame !== null) {
        return;
      }

      filterIndicatorFrame = window.requestAnimationFrame(updateFilterIndicator);
    };

    const renderFilterButtons = function() {
      const topicMetadata = getTopicMetadata();
      const totalCount = getPublicationItems().length;
      const topicEntries = Object.keys(topicMetadata).sort(function(a, b) {
        const countA = topicMetadata[a].count || 0;
        const countB = topicMetadata[b].count || 0;

        if (countB !== countA) {
          return countB - countA;
        }

        return (topicMetadata[a].label || a).localeCompare(topicMetadata[b].label || b);
      });

      if (activeTopic !== 'all' && !topicMetadata[activeTopic]) {
        activeTopic = 'all';
      }

      $toolbar.empty();
      if ($filterIndicator.length > 0) {
        $toolbar.addClass('has-filter-indicator');
        $toolbar.append($filterIndicator);
      }
      $toolbar.append(createFilterButton('all', 'All', totalCount, activeTopic === 'all'));

      topicEntries.forEach(function(topic) {
        $toolbar.append(
          createFilterButton(
            topic,
            topicMetadata[topic].label,
            topicMetadata[topic].count,
            activeTopic === topic
          )
        );
      });

      $toolbar.prop('hidden', totalCount === 0);
      queueFilterIndicator();
    };

    const updatePublicationGroups = function() {
      $container.find('ol.bibliography').each(function() {
        const $list = $(this);
        const hasVisibleItems = $list.children('li:not([hidden])').length > 0;
        $list.prop('hidden', !hasVisibleItems);
      });

      $container.find('h2.bibliography').each(function() {
        const $heading = $(this);
        const $list = $heading.nextAll('ol.bibliography').first();
        const hasVisibleItems = $list.length > 0 && $list.children('li:not([hidden])').length > 0;
        $heading.prop('hidden', !hasVisibleItems);
      });

      const hasAnyVisibleItems = $container.find('ol.bibliography > li:not([hidden])').length > 0;
      $emptyState.prop('hidden', hasAnyVisibleItems);
    };

    const applyTopicFilter = function(topic) {
      activeTopic = normalizeTopic(topic) || 'all';

      getPublicationItems().each(function() {
        const $item = $(this);
        const topicsRaw = $item.find('.publication-row').first().data('topics') || '';
        const topics = topicsRaw
          .split('|')
          .map(normalizeTopic)
          .filter(Boolean);
        const isMatch = activeTopic === 'all' || topics.includes(activeTopic);
        $item.prop('hidden', !isMatch);
      });

      getButtons().removeClass('is-active').attr('aria-pressed', 'false');
      const $activeButton = getButtons().filter(function() {
        return normalizeTopic($(this).data('topic')) === activeTopic;
      }).first();
      if ($activeButton.length) {
        $activeButton.addClass('is-active').attr('aria-pressed', 'true');
      }

      updatePublicationGroups();
      queueFilterIndicator();
    };

    const setActiveTopic = function(topic) {
      const normalizedTopic = normalizeTopic(topic);
      const $targetButton = getButtons().filter(function() {
        return normalizeTopic($(this).data('topic')) === normalizedTopic;
      }).first();

      applyTopicFilter($targetButton.length ? normalizedTopic : 'all');
    };

    $toolbar.on('click', '.publication-filter', function() {
      setActiveTopic($(this).data('topic'));
    });

    $container.on('click', '.publication-topic-chip', function() {
      setActiveTopic($(this).data('topic'));
    });

    renderFilterButtons();
    setActiveTopic('all');
    window.addEventListener('resize', queueFilterIndicator);
  });

  const homeRevealTargets = document.querySelectorAll(
    '.about-page .home-hero, .about-page .home-callout, .about-page .home-logos, .about-page .home-card'
  );

  if (homeRevealTargets.length > 0 && 'IntersectionObserver' in window) {
    document.body.classList.add('home-reveal-enabled');

    homeRevealTargets.forEach(function(target, index) {
      target.classList.add('home-reveal');
      target.style.setProperty('--home-reveal-delay', String(index * 70) + 'ms');
    });

    const revealObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -10% 0px',
    });

    homeRevealTargets.forEach(function(target) {
      revealObserver.observe(target);
    });
  }

  const homeHero = document.querySelector('.about-page .home-hero');

  if (
    homeHero &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    let parallaxFrame = null;
    let targetX = 0;
    let targetY = 0;

    const updateHeroParallax = function() {
      parallaxFrame = null;
      homeHero.style.setProperty('--hero-shift-x', targetX.toFixed(2) + 'px');
      homeHero.style.setProperty('--hero-shift-y', targetY.toFixed(2) + 'px');
    };

    const queueHeroParallax = function() {
      if (parallaxFrame !== null) {
        return;
      }

      parallaxFrame = window.requestAnimationFrame(updateHeroParallax);
    };

    homeHero.addEventListener('mousemove', function(event) {
      const rect = homeHero.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      targetX = (offsetX / rect.width) * 18;
      targetY = (offsetY / rect.height) * 14;
      homeHero.classList.add('is-parallax-active');
      queueHeroParallax();
    });

    homeHero.addEventListener('mouseleave', function() {
      targetX = 0;
      targetY = 0;
      homeHero.classList.remove('is-parallax-active');
      queueHeroParallax();
    });
  }

  const sectionSpotlightTargets = Array.from(
    document.querySelectorAll('.about-page .home-hero, .about-page .home-callout, .about-page .home-logos, .about-page .home-card')
  );

  if (sectionSpotlightTargets.length > 0) {
    let spotlightFrame = null;

    const updateSectionSpotlight = function() {
      spotlightFrame = null;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const viewportCenter = viewportHeight / 2;
      let activeTarget = null;
      let activeDistance = Infinity;

      sectionSpotlightTargets.forEach(function(target) {
        const rect = target.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < viewportHeight;

        target.classList.remove('is-section-active');

        if (!isVisible) {
          return;
        }

        const targetCenter = rect.top + rect.height / 2;
        const distance = Math.abs(targetCenter - viewportCenter);

        if (distance < activeDistance) {
          activeDistance = distance;
          activeTarget = target;
        }
      });

      if (activeTarget) {
        activeTarget.classList.add('is-section-active');
      }
    };

    const queueSectionSpotlight = function() {
      if (spotlightFrame !== null) {
        return;
      }

      spotlightFrame = window.requestAnimationFrame(updateSectionSpotlight);
    };

    updateSectionSpotlight();
    window.addEventListener('scroll', queueSectionSpotlight, { passive: true });
    window.addEventListener('resize', queueSectionSpotlight);
  }

  const navbar = document.getElementById('navbar');
  const navbarNav = navbar ? navbar.querySelector('.navbar-nav') : null;
  const homeLink = document.querySelector('.nav-home-link');
  const navTrackedLinks = navbarNav
    ? Array.from(navbarNav.querySelectorAll('.nav-home-link, .nav-section-link'))
    : [];
  const navbarIndicator = (navbarNav && navTrackedLinks.length > 0 && !prefersReducedMotion)
    ? document.createElement('span')
    : null;
  let navbarIndicatorFrame = null;

  if (navbarIndicator && navbarNav) {
    navbarIndicator.className = 'navbar-current-indicator';
    navbarIndicator.setAttribute('aria-hidden', 'true');
    navbarNav.classList.add('has-current-indicator');
    navbarNav.appendChild(navbarIndicator);
  }

  const updateNavbarIndicator = function() {
    navbarIndicatorFrame = null;

    if (!navbarIndicator || !navbarNav) {
      return;
    }

    const activeLink = navTrackedLinks.find(function(link) {
      return link.classList.contains('is-current');
    });

    if (!activeLink || activeLink.offsetParent === null) {
      navbarIndicator.style.opacity = '0';
      return;
    }

    const inset = 8;
    const indicatorWidth = Math.max(16, activeLink.offsetWidth - inset * 2);
    const indicatorY = activeLink.offsetTop + activeLink.offsetHeight - 2;

    navbarIndicator.style.width = String(indicatorWidth) + 'px';
    navbarIndicator.style.transform = 'translate3d(' + String(activeLink.offsetLeft + inset) + 'px, ' + String(indicatorY) + 'px, 0)';
    navbarIndicator.style.opacity = '1';
  };

  const queueNavbarIndicator = function() {
    if (!navbarIndicator || navbarIndicatorFrame !== null) {
      return;
    }

    navbarIndicatorFrame = window.requestAnimationFrame(updateNavbarIndicator);
  };

  const navSectionEntries = Array.from(document.querySelectorAll('.nav-section-link[href*="#"]'))
    .map(function(link) {
      const href = link.getAttribute('href') || '';
      const hashIndex = href.indexOf('#');
      const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
      const target = hash ? document.querySelector(hash) : null;

      if (!target) {
        return null;
      }

      return { link: link, target: target };
    })
    .filter(Boolean);

  if (navbar && navSectionEntries.length > 0) {
    let navFrame = null;

    const updateHomeSectionNav = function() {
      navFrame = null;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const maxScrollTop = Math.max(
        0,
        (document.documentElement.scrollHeight || document.body.scrollHeight || 0) - viewportHeight
      );
      const navbarHeight = navbar.offsetHeight || 56;
      const nearTop = scrollTop < 36;
      const nearBottom = maxScrollTop - scrollTop < Math.max(48, viewportHeight * 0.08);
      const activationScroll = scrollTop + navbarHeight + Math.min(160, viewportHeight * 0.28);
      let currentEntry = null;

      navSectionEntries.forEach(function(entry) {
        const rect = entry.target.getBoundingClientRect();
        const sectionTop = rect.top + scrollTop;

        entry.link.classList.remove('is-current');

        if (sectionTop <= activationScroll) {
          currentEntry = entry;
        }
      });

      if (nearBottom) {
        currentEntry = navSectionEntries[navSectionEntries.length - 1];
      } else if (!currentEntry && nearTop) {
        currentEntry = navSectionEntries[0];
      }

      if (homeLink) {
        homeLink.classList.toggle('is-current', nearTop);
      }

      if (currentEntry) {
        currentEntry.link.classList.add('is-current');
      }

      queueNavbarIndicator();
    };

    const queueHomeSectionNav = function() {
      if (navFrame !== null) {
        return;
      }

      navFrame = window.requestAnimationFrame(updateHomeSectionNav);
    };

    updateHomeSectionNav();
    window.addEventListener('scroll', queueHomeSectionNav, { passive: true });
    window.addEventListener('resize', queueHomeSectionNav);
  }

  if (navbarIndicator) {
    const navbarCollapse = document.getElementById('navbarNav');
    queueNavbarIndicator();
    window.addEventListener('resize', queueNavbarIndicator);

    if (navbarCollapse) {
      navbarCollapse.addEventListener('shown.bs.collapse', queueNavbarIndicator);
      navbarCollapse.addEventListener('hidden.bs.collapse', queueNavbarIndicator);
    }
  }

  const footerTopLinks = Array.from(document.querySelectorAll('.site-footer__top'));

  if (footerTopLinks.length > 0) {
    let footerTopFrame = null;

    const updateFooterTopProgress = function() {
      footerTopFrame = null;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const scrollTop = window.scrollY || window.pageYOffset || 0;
      const maxScrollTop = Math.max(
        0,
        (document.documentElement.scrollHeight || document.body.scrollHeight || 0) - viewportHeight
      );
      const progress = maxScrollTop > 0 ? Math.min(100, (scrollTop / maxScrollTop) * 100) : 0;
      const isScrollReady = maxScrollTop > Math.max(40, viewportHeight * 0.1);

      footerTopLinks.forEach(function(link) {
        link.style.setProperty('--scroll-progress', progress.toFixed(2));
        link.classList.toggle('is-scroll-ready', isScrollReady);
      });
    };

    const queueFooterTopProgress = function() {
      if (footerTopFrame !== null) {
        return;
      }

      footerTopFrame = window.requestAnimationFrame(updateFooterTopProgress);
    };

    updateFooterTopProgress();
    window.addEventListener('scroll', queueFooterTopProgress, { passive: true });
    window.addEventListener('resize', queueFooterTopProgress);
  }

  const smoothAnchorLinks = Array.from(
    document.querySelectorAll('.nav-section-link[href*="#"], .site-footer__top[href^="#"], a[href^="#bio"], a[href^="#news"], a[href^="#publications"], a[href^="#experience"], a[href^="#impact"]')
  );

  if (smoothAnchorLinks.length > 0 && !prefersReducedMotion) {
    smoothAnchorLinks.forEach(function(link) {
      link.addEventListener('click', function(event) {
        const href = link.getAttribute('href') || '';
        const hashIndex = href.indexOf('#');
        const hash = hashIndex >= 0 ? href.slice(hashIndex) : '';
        const target = hash ? document.querySelector(hash) : null;

        if (!target) {
          return;
        }

        const isSamePageHomeLink =
          href === hash ||
          href === '/' + hash ||
          href.endsWith(hash);

        if (!isSamePageHomeLink) {
          return;
        }

        event.preventDefault();

        const navbarOffset = (navbar ? navbar.offsetHeight : 56) + 18;
        const targetTop = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) - navbarOffset;

        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: 'smooth',
        });
      });
    });
  }

});
