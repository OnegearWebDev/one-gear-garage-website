document.getElementById("contact-form").addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm("11259225", "1125", this)
    .then(() => {
      alert("Message sent successfully! 🖤");
      this.reset();
    }, (err) => {
      alert("Failed to send message. ❌ " + JSON.stringify(err));
    });
});
