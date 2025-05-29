firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById("welcome").innerText = "สวัสดี " + (user.displayName || user.email);
  } else {
    window.location.href = "index.html";
  }
});

function logout() {
  firebase.auth().signOut().then(() => {
    window.location.href = "index.html";
  });
}
