(function () {
  // Text lines for each slide
  const textLines = [
    "Smart moves. Sharp insights. Financial freedom—your way.",
    "The gap between where you are and where you want to be? We close it.",
    "151 million shares. Countless success stories. One trusted partner.",
    "Ready to make your money work harder?",
  ];

  // Typing effect variables
  let charIndex = 0;
  let isTyping = false;

  // Get all span elements for typing
  const lineElements = [
    document.getElementById("line1-slide1"),
    document.getElementById("line2-slide2"),
    document.getElementById("line3-slide3"),
    document.getElementById("line4-slide4"),
  ];

  // Log to check if elements are found
  console.log("Line elements:", lineElements);

  // Reset typing for all slides
  function resetTyping() {
    lineElements.forEach((el, index) => {
      if (el) {
        el.textContent = "";
        console.log(`Reset text for slide ${index + 1}`);
      } else {
        console.error(`Element for slide ${index + 1} not found`);
      }
    });
    charIndex = 0;
    isTyping = false;
  }

  // Type text for the specified slide
  function typeText(slideIndex) {
    if (isTyping) {
      console.log("Typing already in progress, skipping");
      return; // Prevent overlapping typing
    }
    isTyping = true;

    const currentLine = textLines[slideIndex];
    const targetEl = lineElements[slideIndex];

    if (!targetEl) {
      console.error(`Target element for slide ${slideIndex + 1} not found`);
      isTyping = false;
      return;
    }

    if (!currentLine) {
      console.error(`No text defined for slide ${slideIndex + 1}`);
      isTyping = false;
      return;
    }

    console.log(`Starting typing for slide ${slideIndex + 1}: ${currentLine}`);

    function typeChar() {
      if (charIndex < currentLine.length) {
        targetEl.textContent += currentLine.charAt(charIndex);
        charIndex++;
        console.log(`Typed character ${charIndex} for slide ${slideIndex + 1}: ${targetEl.textContent}`);
        setTimeout(typeChar, 70); // Typing speed
      } else {
        console.log(`Finished typing for slide ${slideIndex + 1}`);
        charIndex = 0;
        isTyping = false;
      }
    }

    typeChar(); // Start typing
  }

  // Initialize Slick Slider
  $(document).ready(function () {
    if ($(".hero_Slider").length === 0) {
      console.error("Slick Slider container (.hero_Slider) not found in the DOM");
      return;
    }

    try {
      $(".hero_Slider").slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false,
        autoplaySpeed: 4000,
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
              arrows: false,
              dots: true,
            },
          },
        ],
      });

      console.log("Slick Slider initialized successfully");

      // Typing effect on slide change
      $(".hero_Slider").on("beforeChange", function (event, slick, currentSlide, nextSlide) {
        console.log(`Slide changing from ${currentSlide + 1} to ${nextSlide + 1}`);
        resetTyping();
        typeText(nextSlide);
      });
    } catch (error) {
      console.error("Error initializing Slick Slider:", error);
    }
  });

  // Start typing for the first slide on page load
  window.addEventListener("DOMContentLoaded", () => {
    if (lineElements[0]) {
      console.log("Starting initial typing for slide 1");
      typeText(0);
    } else {
      console.error("Initial typing element (line1-slide1) not found");
    }
  });
})();