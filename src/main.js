const animateElemetns = document.querySelectorAll(".animate");

animateElemetns.forEach((el,index) => {
  setTimeout(() => {
    el.classList.add("show");
  }, index * 300);
});