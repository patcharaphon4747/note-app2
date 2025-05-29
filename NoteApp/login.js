const provider = new firebase.auth.GoogleAuthProvider();
const loginBtn = document.getElementById("login-btn");

loginBtn.onclick = () => {
  firebase.auth().signInWithPopup(provider)
    .then(result => {
      window.location.href = "note.html";
    })
    .catch(error => {
      alert("Login failed: " + error.message);
    });
};
