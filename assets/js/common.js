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

  const $publicationContainers = $('.publications[data-publication-filters]');

  $publicationContainers.each(function() {
    const $container = $(this);
    const $emptyState = $container.find('.publication-filter-empty');
    const $toolbar = $container.find('.publication-filters').first();
    let activeTopic = 'all';

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
  });
});
