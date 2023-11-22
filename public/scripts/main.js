(function ($) {
  var $window = $(window),
    $body = $("body"),
    $wrapper = $("#wrapper");

  breakpoints({
    xlarge: ["1281px", "1680px"],
    large: ["981px", "1280px"],
    medium: ["737px", "980px"],
    small: ["481px", "736px"],
    xsmall: [null, "480px"],
  });

  // Hack: Enable IE workarounds.
  if (browser.name == "ie") $body.addClass("ie");

  // Touch?
  if (browser.mobile) $body.addClass("touch");

  // Transitions supported?
  if (browser.canUse("transition")) {
    // Play initial animations on page load.
    $window.on("load", function () {
      window.setTimeout(function () {
        $body.removeClass("is-preload");
      }, 100);
    });

    // Prevent transitions/animations on resize.
    var resizeTimeout;

    $window.on("resize", function () {
      window.clearTimeout(resizeTimeout);

      $body.addClass("is-resizing");

      resizeTimeout = window.setTimeout(function () {
        $body.removeClass("is-resizing");
      }, 100);
    });
  }

  // Scroll back to top.
  $window.scrollTop(0);

  // Panels.
  var $panels = $(".panel");

  $panels.each(function () {
    var $this = $(this),
      $toggles = $('[href="#' + $this.attr("id") + '"]'),
      $closer = $('<div class="closer" />').appendTo($this);

    // Closer.
    $closer.on("click", function (event) {
      $this.trigger("---hide");
    });

    // Events.
    $this
      .on("click", function (event) {
        event.stopPropagation();
      })
      .on("---toggle", function () {
        if ($this.hasClass("active")) $this.triggerHandler("---hide");
        else $this.triggerHandler("---show");
      })
      .on("---show", function () {
        // Hide other content.
        if ($body.hasClass("content-active")) $panels.trigger("---hide");

        // Activate content, toggles.
        $this.addClass("active");
        $toggles.addClass("active");

        // Activate body.
        $body.addClass("content-active");
      })
      .on("---hide", function () {
        // Deactivate content, toggles.
        $this.removeClass("active");
        $toggles.removeClass("active");

        // Deactivate body.
        $body.removeClass("content-active");
      });

    // Toggles.
    $toggles
      .removeAttr("href")
      .css("cursor", "pointer")
      .on("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        $this.trigger("---toggle");
      });
  });

  // Global events.
  $body.on("click", function (event) {
    if ($body.hasClass("content-active")) {
      event.preventDefault();
      event.stopPropagation();

      $panels.trigger("---hide");
    }
  });

  $window.on("keyup", function (event) {
    if (event.keyCode == 27 && $body.hasClass("content-active")) {
      event.preventDefault();
      event.stopPropagation();

      $panels.trigger("---hide");
    }
  });

  // Header.
  var $header = $("#header");

  // Links.
  $header.find("a").each(function () {
    var $this = $(this),
      href = $this.attr("href");

    // Internal link? Skip.
    if (!href || href.charAt(0) == "#") return;

    // Redirect on click.
    $this
      .removeAttr("href")
      .css("cursor", "pointer")
      .on("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        window.location.href = href;
      });
  });

  // Footer.
  var $footer = $("#footer");

  // Copyright.
  // This basically just moves the copyright line to the end of the *last* sibling of its current parent
  // when the "medium" breakpoint activates, and moves it back when it deactivates.
  $footer.find(".copyright").each(function () {
    var $this = $(this),
      $parent = $this.parent(),
      $lastParent = $parent.parent().children().last();

    breakpoints.on("<=medium", function () {
      $this.appendTo($lastParent);
    });

    breakpoints.on(">medium", function () {
      $this.appendTo($parent);
    });
  });

  // Main.
  var $main = $("#main");

  addEventHandlerToThumb();
  // addPopTrox();
  // Hack: Set margins to 0 when 'xsmall' activates.
  // breakpoints.on("<=xsmall", function () {
  //   $main[0]._poptrox.windowMargin = 0;
  // });

  // breakpoints.on(">xsmall", function () {
  //   $main[0]._poptrox.windowMargin = 50;
  // });

  //   let fetching = false;
  //   let skip = 20;
  //   window.onscroll = function(ev) {
  //     if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 500) {
  //      if(fetching == true){
  //       return;
  //      }

  //      fetching = true;

  //      fetchImages(skip, (data) => {
  //       fetching = false;
  //       skip += 20;
  //       appendImages(data);
  //       addEventHandlerToThumb();
  //       // console.log('add poptrox');
  //       // addPopTrox();
  //      },
  //      () => {
  //       fetching = false;
  //      });
  //     }
  // };
})(jQuery);

let queue = [];

fetchImages((data) => {
  queue = data;
});

setInterval(() => {
  fetchImages((data) => {
    queue = data;
    console.log(queue);
  });
}, 10000);

setInterval(() => {
  if (queue && queue.length) {
    const randomImageInQueue = queue[Math.floor(Math.random() * 20)];
    const randomThumbIndex = Math.floor(Math.random() * 20);
    replaceThumb(randomThumbIndex, randomImageInQueue);
  }
}, 3000);

function replaceThumb(index, data) {
  const aTags = document.querySelectorAll("#main .thumb a");

  const image = new Image();

  image.onload = () => {
    aTags[index].className = aTags[0].className.replace(
      "carved-in",
      "erased-out"
    );

    setTimeout(() => {
      aTags[index].style.backgroundImage = `url(${image.src})`;
      aTags[index].className = aTags[0].className.replace(
        "erased-out",
        "carved-in"
      );
    }, 1300);
  };

  image.src = data.link;

  const imgs = document.querySelectorAll("#main .thumb img");
  imgs[index].src = data.link;

  titles = document.querySelectorAll("#main .thumb p");
  titles[index].innerText = data.date;
}

function fetchImages(callback, errorCallback) {
  $.ajax({
    url: `https://4rtiajugwy.ap-southeast-1.awsapprunner.com/api/gallery`,
    type: "GET",
    dataType: "json",
    async: true,
    crossDomain: true,
    headers: {
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    success: (data) => {
      callback(data);
    },
    error: () => {
      errorCallback();
    },
  });
}

function addEventHandlerToThumb() {
  var $main = $("#main");

  // Thumbs.
  $main.children(".thumb").each(function () {
    var $this = $(this),
      $image = $this.find(".image"),
      $image_img = $image.children("img"),
      x;

    // No image? Bail.
    if ($image.length == 0) return;

    // Image.
    // This sets the background of the "image" <span> to the image pointed to by its child
    // <img> (which is then hidden). Gives us way more flexibility.

    // Set background.
    $image.css("background-image", "url(" + $image_img.attr("src") + ")");

    // Set background position.
    if ((x = $image_img.data("position"))) $image.css("background-position", x);

    // Hide original img.
    $image_img.hide();
  });
}

// Poptrox.
function addPopTrox() {
  const $body = $("body");
  const main = $("#main");
  main.poptrox({
    baseZIndex: 20000,
    caption: function ($a) {
      var s = "";

      $a.nextAll().each(function () {
        s += this.outerHTML;
      });

      return s;
    },
    fadeSpeed: 300,
    onPopupClose: function () {
      $body.removeClass("modal-active");
    },
    onPopupOpen: function () {
      $body.addClass("modal-active");
    },
    overlayOpacity: 0,
    popupCloserText: "",
    popupHeight: 150,
    popupLoaderText: "",
    popupSpeed: 300,
    popupWidth: 150,
    selector: ".thumb > a.image",
    usePopupCaption: true,
    usePopupCloser: true,
    usePopupDefaultStyling: false,
    usePopupForceClose: true,
    usePopupLoader: true,
    usePopupNav: true,
    windowMargin: 50,
  });
}
