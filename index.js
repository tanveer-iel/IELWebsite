$(document).ready(function () {
  // Only run on homepage/index
  if (window.location.pathname === "/" || window.location.pathname.endsWith("index.html")) {
    const STORAGE_KEY = "dualPopupDismissed";
    const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    // Get stored timestamp
    const dismissedTime = localStorage.getItem(STORAGE_KEY);

    // Show popup if: never dismissed OR more than 24 hours passed
    const shouldShow = !dismissedTime || (Date.now() - parseInt(dismissedTime, 10) > ONE_DAY_MS);

    if (shouldShow) {
      $("#dualPopupContainer").removeClass("hidden");

      $(".modal_carousel").slick({
        dots: true,
        infinite: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: true,
        autoplay: false,
        speed: 1000,
        cssEase: "ease-in-out",
        swipe: true,
        draggable: true,
        touchThreshold: 5,
        pauseOnHover: true,
        pauseOnFocus: true,
        pauseOnDotsHover: true,
        responsive: [
          { breakpoint: 1122, settings: { slidesToShow: 1, slidesToScroll: 1 } },
          { breakpoint: 768,  settings: { slidesToShow: 1, slidesToScroll: 1 } }
        ]
      });

      // Function to close popup and optionally remember
      function handleClose() {
        const dontShowChecked = $("#dontShowAgain").is(":checked");

        $("#dualPopupContainer").addClass("hidden");

        // Only save to localStorage if checkbox is checked
        if (dontShowChecked) {
          localStorage.setItem(STORAGE_KEY, Date.now().toString());
        }
      }

      // Trigger close on:
      // 1. × button on any slide
      $(".close-slide").on("click", handleClose);

      // 2. "I Understand" button
      $("#understandBtn").on("click", handleClose);

      // 3. Click outside (backdrop only)
      $("#dualPopupContainer").on("click", function (e) {
        if (e.target === this) {
          handleClose();
        }
      });

      // 4. Press Esc key
      $(document).on("keydown", function (e) {
        if (e.key === "Escape") {
          handleClose();
        }
      });
    }
  }
});
$(document).ready(function () {
  $(".partner_carousel").slick({
    dots: false,
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 0,
    speed: 3000,
    cssEase: "linear",
    pauseOnHover: false,
    swipe: false,
    draggable: false,
    responsive: [
      {
        breakpoint: 1122,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });
});

$(document).ready(function () {
  $(".hero_Slider").slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    dots: true,
    arrows: false,
    infinite: true,
    speed: 1000,
    fade: false,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false, // Hide arrows on mobile
          dots: true,
        },
      },
    ],
  });
});
// AOS.init();

const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");
menuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Resources Dropdown Toggle (Mobile)
const resourcesToggle = document.getElementById("resources-toggle");
const resourcesDropdown = document.getElementById("resources-dropdown");
resourcesToggle.addEventListener("click", () => {
  resourcesDropdown.classList.toggle("hidden");
});

const InvestorToggle = document.getElementById("investor-toggle");
const Investorropdown = document.getElementById("investor-dropdown");
InvestorToggle.addEventListener("click", () => {
  Investorropdown.classList.toggle("hidden");
});

let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      AOS.refresh(); // If using AOS, refresh it in a less frequent way
      updateTextPosition();
      ticking = false;
    });
    ticking = true;
  }
});

// function updateTextPosition() {
//   let textElement = document.getElementById("scrollText");
//   if (!textElement) return;

//   let scrollY = window.scrollY;
//   let factor;
//   // = window.innerWidth < 768 ? 0.5 : 0.8;
//   if (window.innerWidth < 768) {
//     factor = 0.4; // Mobile - Small screens
//   } else if (window.innerWidth < 1200) {
//     factor = 0.4; // Mobile - Medium screens
//   } else {
//     factor = 0.7; // Tablets
//   }
//   let translateY = -1000 + scrollY * factor; // Moves up from -1000px

//   textElement.style.transform = `translateY(${-translateY}px)`;
//   textElement.style.opacity = Math.min(1, scrollY / 500); // Smooth fade-in
// }


