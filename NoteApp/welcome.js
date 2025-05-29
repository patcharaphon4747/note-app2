const auth = firebase.auth();

const welcomeMsg = document.getElementById("welcome-msg");
const logoutBtn = document.getElementById("logout-btn");

auth.onAuthStateChanged(user => {
  if (user) {
    // แสดงชื่อผู้ใช้
    welcomeMsg.textContent = `สวัสดี ${user.displayName}`;
  } else {
    // ถ้าไม่มี user กลับไปหน้า login
    window.location.href = "index.html";
  }
});

logoutBtn.addEventListener("click", () => {
  auth.signOut()
    .then(() => {
      window.location.href = "index.html";
    })
    .catch(error => {
      alert("เกิดข้อผิดพลาดในการออกจากระบบ: " + error.message);
      console.error(error);
    });
});
