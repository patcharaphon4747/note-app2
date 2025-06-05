// app.js

// Ensure `auth` and `db` are initialized in firebase-config.js which should be loaded before this file.

// =====================================================================
// Global Element References (Declared at top-level for accessibility)
// These elements are expected to exist on specific pages.
// Using optional chaining (?) to prevent errors on pages where they don't exist.
// =====================================================================
const userNameSpan = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard specific elements
const totalSalesCard = document.getElementById('total-sales-card')?.querySelector('p');
const totalOrdersCard = document.getElementById('total-orders-card')?.querySelector('p');
const newCustomersCard = document.getElementById('new-customers-card')?.querySelector('p');
const topMenuList = document.getElementById('top-menu-list');
const salesChartCtx = document.getElementById('salesChart')?.getContext('2d');
let salesChartInstance; // To store Chart.js instance

// Menu specific elements
const menuList = document.getElementById('menu-list');
const addMenuForm = document.getElementById('add-menu-form');

// Customers specific elements
const customersTableBody = document.getElementById('customers-table');

// Orders specific elements
const ordersTableBody = document.getElementById('orders-table');

// Promotions specific elements
const promoList = document.querySelector('.promo-list');

// Reports specific elements
const reportPlaceholder = document.querySelector('.report-placeholder');
const reportSalesChartCtx = document.getElementById('reportSalesChart')?.getContext('2d'); // Canvas for reports chart
let reportSalesChartInstance; // To store Chart.js instance for reports


// =====================================================================
// Global Authentication & Logout Logic
// This function is declared globally.
// =====================================================================
const handleLogout = () => {
    auth.signOut()
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch(error => {
            alert('เกิดข้อผิดพลาดในการออกจากระบบ: ' + error.message);
            console.error("Logout error: ", error);
        });
};


// =====================================================================
// Dashboard Specific Functions (for index.html)
// These functions are declared globally.
// =====================================================================
async function updateDashboardData() {
    // Check if required elements exist on this specific page
    if (!totalSalesCard || !totalOrdersCard || !newCustomersCard || !topMenuList || !salesChartCtx) {
        return;
    }

    try {
        // --- Total Sales Today, Total Orders Today, New Customers Today ---
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to midnight of today

        const ordersSnapshot = await db.collection('orders')
            .where('orderDate', '>=', today)
            .get();

        let totalSalesToday = 0;
        let totalOrdersToday = ordersSnapshot.size;

        ordersSnapshot.forEach(doc => {
            totalSalesToday += doc.data().total || 0;
        });

        totalSalesCard.textContent = `฿${totalSalesToday.toFixed(2)}`;
        totalOrdersCard.textContent = `${totalOrdersToday} รายการ`;

        const customersSnapshot = await db.collection('customers')
            .where('createdAt', '>=', today)
            .get();
        newCustomersCard.textContent = `${customersSnapshot.size} คน`;

        // --- Top 5 Popular Menus (Currently fetches 5 menus by name) ---
        // (Actual calculation of top popular menus requires aggregation from 'orders' collection, which is more complex)
        const menusSnapshot = await db.collection('menus').orderBy('name').limit(5).get();
        if (topMenuList) {
            if (menusSnapshot.empty) {
                topMenuList.innerHTML = '<li>ไม่มีข้อมูลเมนูยอดนิยม</li>';
            } else {
                topMenuList.innerHTML = '';
                menusSnapshot.forEach(doc => {
                    const menu = doc.data();
                    const li = document.createElement('li');
                    li.textContent = `${menu.name} - ${menu.price} บาท`;
                    topMenuList.appendChild(li);
                });
            }
        }

        // --- Weekly Sales Chart (Mock Data) ---
        const weeklySalesData = [
            Math.floor(Math.random() * 5000) + 1000,
            Math.floor(Math.random() * 5000) + 1000,
            Math.floor(Math.random() * 5000) + 1000,
            Math.floor(Math.random() * 5000) + 1000,
            Math.floor(Math.random() * 5000) + 1000,
            Math.floor(Math.random() * 5000) + 1000,
            Math.floor(Math.random() * 5000) + 1000
        ];

        if (salesChartInstance) {
            salesChartInstance.destroy(); // Destroy previous chart instance before creating a new one
        }

        salesChartInstance = new Chart(salesChartCtx, {
            type: 'bar',
            data: {
                labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
                datasets: [{
                    label: 'ยอดขาย (บาท)',
                    data: weeklySalesData,
                    backgroundColor: '#f26464'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '฿' + value;
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });

    } catch (error) {
        console.error("Error updating dashboard: ", error);
        // Display error messages on dashboard cards
        if (totalSalesCard) totalSalesCard.textContent = '฿ERR';
        if (totalOrdersCard) totalOrdersCard.textContent = 'ERR';
        if (newCustomersCard) newCustomersCard.textContent = 'ERR';
        if (topMenuList) topMenuList.innerHTML = '<li>เกิดข้อผิดพลาดในการโหลดข้อมูล</li>';
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล Dashboard: ' + error.message);
    }
}


// =====================================================================
// Menu Specific Functions (for menu.html)
// These functions are declared globally.
// =====================================================================
async function renderMenuFromFirestore() {
    if (!menuList) return; // Ensure element exists on this page
    menuList.innerHTML = '<li>กำลังโหลดเมนู...</li>';
    try {
        const snapshot = await db.collection('menus').orderBy('name').get();
        if (snapshot.empty) {
            menuList.innerHTML = '<li>ไม่มีเมนูอาหารในขณะนี้</li>';
            return;
        }

        menuList.innerHTML = ''; // Clear loading message
        snapshot.forEach(doc => {
            const menu = doc.data();
            const li = document.createElement('li');
            li.innerHTML = `
                ${menu.name} - ${menu.price} บาท
                <button class="delete-btn" data-id="${doc.id}">ลบ</button>
                <button class="edit-btn" data-id="${doc.id}" data-name="${menu.name}" data-price="${menu.price}">แก้ไข</button>
            `;
            menuList.appendChild(li);
        });

        // Add event listeners to all 'ลบ' and 'แก้ไข' buttons
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', handleDeleteMenu);
        });
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', handleEditMenu);
        });

    } catch (error) {
        console.error("Error rendering menus: ", error);
        menuList.innerHTML = '<li>เกิดข้อผิดพลาดในการโหลดเมนู</li>';
        alert('เกิดข้อผิดพลาดในการโหลดเมนู: ' + error.message);
    }
}

async function handleDeleteMenu(event) {
    const menuId = event.target.dataset.id;
    if (confirm('คุณต้องการลบเมนูนี้หรือไม่?')) { // Using confirm for simplicity, consider custom modal for production
        try {
            await db.collection('menus').doc(menuId).delete();
            alert('ลบเมนูเรียบร้อย!');
            renderMenuFromFirestore(); // Re-render menu list after deletion
        } catch (error) {
            console.error("Error deleting menu: ", error);
            alert('เกิดข้อผิดพลาดในการลบเมนู: ' + error.message);
        }
    }
}

async function handleEditMenu(event) {
    const menuId = event.target.dataset.id;
    const oldName = event.target.dataset.name;
    const oldPrice = parseFloat(event.target.dataset.price);

    const newName = prompt(`แก้ไขชื่อเมนู "${oldName}":`, oldName);
    if (newName === null) return;

    const newPriceStr = prompt(`แก้ไขราคา "${oldName}" (${oldPrice} บาท):`, oldPrice);
    if (newPriceStr === null) return;

    const newPrice = parseFloat(newPriceStr);

    if (!newName.trim() || isNaN(newPrice) || newPrice <= 0) {
        alert('กรุณากรอกข้อมูลที่ถูกต้อง');
        return;
    }

    try {
        await db.collection('menus').doc(menuId).update({
            name: newName.trim(),
            price: newPrice
        });
        alert('แก้ไขเมนูเรียบร้อย!');
        renderMenuFromFirestore(); // Re-render menu list after update
    } catch (error) {
        console.error("Error updating menu: ", error);
        alert('เกิดข้อผิดพลาดในการแก้ไขเมนู: ' + error.message);
    }
}


// =====================================================================
// Customers Specific Functions (for customers.html)
// These functions are declared globally.
// =====================================================================
async function renderCustomersFromFirestore() {
    if (!customersTableBody) return; // Ensure element exists on this page
    customersTableBody.innerHTML = '<tr><td colspan="4">กำลังโหลดข้อมูลลูกค้า...</td></tr>';
    try {
        const snapshot = await db.collection('customers').orderBy('createdAt', 'desc').get();
        if (snapshot.empty) {
            customersTableBody.innerHTML = '<tr><td colspan="4">ไม่มีข้อมูลลูกค้าในขณะนี้</td></tr>';
            return;
        }

        customersTableBody.innerHTML = ''; // Clear loading message
        let index = 1;
        snapshot.forEach(doc => {
            const customer = doc.data();
            const tr = document.createElement('tr');
            const createdAtDate = customer.createdAt ? new Date(customer.createdAt.toDate()).toLocaleDateString('th-TH') : 'ไม่ระบุ';
            tr.innerHTML = `
                <td style="padding: 0.5rem;">${index++}</td>
                <td style="padding: 0.5rem;">${customer.name || 'ไม่มีชื่อ'}</td>
                <td style="padding: 0.5rem;">${customer.email || 'ไม่มีอีเมล'}</td>
                <td style="padding: 0.5rem;">${createdAtDate}</td>
            `;
            customersTableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error rendering customers: ", error);
        customersTableBody.innerHTML = '<tr><td colspan="4">เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า</td></tr>';
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลลูกค้า: ' + error.message);
    }
}


// =====================================================================
// Orders Specific Functions (for orders.html)
// These functions are declared globally.
// =====================================================================
async function renderOrdersFromFirestore() {
    if (!ordersTableBody) return; // Ensure element exists on this page
    ordersTableBody.innerHTML = '<tr><td colspan="5">กำลังโหลดข้อมูลรายการสั่งซื้อ...</td></tr>';
    try {
        const snapshot = await db.collection('orders').orderBy('orderDate', 'desc').get();
        if (snapshot.empty) {
            ordersTableBody.innerHTML = '<tr><td colspan="5">ไม่มีรายการสั่งซื้อในขณะนี้</td></tr>';
            return;
        }

        ordersTableBody.innerHTML = ''; // Clear loading message
        let index = 1;
        snapshot.forEach(doc => {
            const order = doc.data();
            const tr = document.createElement('tr');

            const orderDate = order.orderDate ? new Date(order.orderDate.toDate()).toLocaleString('th-TH') : 'ไม่ระบุ';
            let menuDetails = order.menuName || 'ไม่ระบุเมนู'; // Default for single item buy.html order
            if (order.items && Array.isArray(order.items)) { // If order contains multiple items (e.g., from a cart)
                menuDetails = order.items.map(item => `${item.name} (x${item.quantity})`).join(', ');
            }

            tr.innerHTML = `
                <td style="padding: 0.5rem;">${index++}</td>
                <td style="padding: 0.5rem;">${order.customerName || 'ไม่ระบุลูกค้า'}</td>
                <td style="padding: 0.5rem;">${menuDetails}</td>
                <td style="padding: 0.5rem;">฿${(order.total || 0).toFixed(2)}</td>
                <td style="padding: 0.5rem;">${orderDate}</td>
            `;
            ordersTableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("Error rendering orders: ", error);
        ordersTableBody.innerHTML = '<tr><td colspan="5">เกิดข้อผิดพลาดในการโหลดข้อมูลรายการสั่งซื้อ</td></tr>';
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลรายการสั่งซื้อ: ' + error.message);
    }
}

// =====================================================================
// Promotion Specific Functions (for promotion.html)
// These functions are declared globally.
// =====================================================================
async function renderPromotionsFromFirestore() {
    if (!promoList) return; // Ensure element exists on this page
    promoList.innerHTML = '<li>กำลังโหลดข้อมูลโปรโมชั่น...</li>';
    try {
        const snapshot = await db.collection('promotions').orderBy('endDate').get();
        if (snapshot.empty) {
            promoList.innerHTML = '<li>ไม่มีโปรโมชั่นในขณะนี้</li>';
            return;
        }

        promoList.innerHTML = ''; // Clear loading message
        snapshot.forEach(doc => {
            const promo = doc.data();
            const li = document.createElement('li');
            const startDate = promo.startDate ? new Date(promo.startDate.toDate()).toLocaleDateString('th-TH') : 'ไม่ระบุ';
            const endDate = promo.endDate ? new Date(promo.endDate.toDate()).toLocaleDateString('th-TH') : 'ไม่ระบุ';

            li.innerHTML = `
                <h3>${promo.title || 'ไม่มีชื่อโปรโมชั่น'}</h3>
                <p>${promo.description || 'ไม่มีรายละเอียด'}</p>
                <p>ตั้งแต่วันที่ ${startDate} - ${endDate}</p>
            `;
            promoList.appendChild(li);
        });

    } catch (error) {
        console.error("Error rendering promotions: ", error);
        promoList.innerHTML = '<li>เกิดข้อผิดพลาดในการโหลดข้อมูลโปรโมชั่น</li>';
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูลโปรโมชั่น: ' + error.message);
    }
}


// =====================================================================
// Reports Specific Functions (for reports.html)
// These functions are declared globally.
// =====================================================================
async function generateReports() {
    if (!reportPlaceholder) return; // Ensure element exists on this page
    reportPlaceholder.innerHTML = 'กำลังสร้างรายงาน...';
    try {
        const ordersSnapshot = await db.collection('orders').get();
        const menusSnapshot = await db.collection('menus').get();
        const customersSnapshot = await db.collection('customers').get();

        let totalSales = 0;
        ordersSnapshot.forEach(doc => {
            totalSales += doc.data().total || 0;
        });

        reportPlaceholder.innerHTML = `
            <h2>สรุปรายงานโดยรวม</h2>
            <p><strong>ยอดขายทั้งหมด:</strong> ฿${totalSales.toFixed(2)}</p>
            <p><strong>จำนวนรายการสั่งซื้อทั้งหมด:</strong> ${ordersSnapshot.size} รายการ</p>
            <p><strong>จำนวนลูกค้าทั้งหมด:</strong> ${customersSnapshot.size} คน</p>
            <hr style="margin: 1.5rem 0; border-color: #f6c1c1;">
            <h3>ข้อมูลรายงานเชิงลึก (จะเพิ่มในอนาคต)</h3>
            <p>คุณสามารถเพิ่มกราฟ (ใช้ Chart.js) หรือตารางรายงานสำหรับ:</p>
            <ul>
                <li>ยอดขายรายวัน/รายเดือน/รายปี</li>
                <li>เมนูยอดนิยม</li>
                <li>ลูกค้าที่สั่งซื้อบ่อยที่สุด</li>
                <li>โปรโมชั่นที่ได้รับความนิยม</li>
            </ul>
        `;

        // Example of adding a chart in the Reports page (if canvas ID 'reportSalesChart' exists)
        if (reportSalesChartCtx) {
            // Mock data for reports chart
            const reportWeeklySalesData = [
                Math.floor(Math.random() * 8000) + 2000,
                Math.floor(Math.random() * 8000) + 2000,
                Math.floor(Math.random() * 8000) + 2000,
                Math.floor(Math.random() * 8000) + 2000,
                Math.floor(Math.random() * 8000) + 2000,
                Math.floor(Math.random() * 8000) + 2000,
                Math.floor(Math.random() * 8000) + 2000
            ];

            if (reportSalesChartInstance) {
                reportSalesChartInstance.destroy();
            }

            reportSalesChartInstance = new Chart(reportSalesChartCtx, {
                type: 'line', // Line chart for reports
                data: {
                    labels: ['สัปดาห์ 1', 'สัปดาห์ 2', 'สัปดาห์ 3', 'สัปดาห์ 4', 'สัปดาห์ 5', 'สัปดาห์ 6', 'สัปดาห์ 7'],
                    datasets: [{
                        label: 'ยอดขายรวม (บาท)',
                        data: reportWeeklySalesData,
                        backgroundColor: 'rgba(242, 100, 100, 0.5)',
                        borderColor: '#f26464',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '฿' + value;
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true
                        }
                    }
                }
            });
        }


    } catch (error) {
        console.error("Error generating reports: ", error);
        reportPlaceholder.innerHTML = '<p>เกิดข้อผิดพลาดในการสร้างรายงาน</p>';
        alert('เกิดข้อผิดพลาดในการสร้างรายงาน: ' + error.message);
    }
}


// =====================================================================
// Main Auth State Listener & Page-specific Function Calls
// This section runs when Firebase authentication state changes.
// =====================================================================
auth.onAuthStateChanged(user => {
    // Update user info and attach logout listener on all pages with header
    if (userNameSpan) {
        userNameSpan.textContent = user ? (user.displayName || user.email || 'คุณผู้ใช้') : 'คุณผู้ใช้';
    }
    if (logoutBtn) {
        // Remove previous listener to prevent duplicates, then add
        logoutBtn.removeEventListener('click', handleLogout);
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (user) {
        // User is signed in.
        // Call page-specific functions based on current path
        const currentPath = window.location.pathname;

        if (currentPath.includes('index.html') || currentPath === '/') {
            updateDashboardData();
        } else if (currentPath.includes('menu.html')) {
            renderMenuFromFirestore();
            // Attach form submit listener for adding menu only if form exists on this page
            if (addMenuForm) {
                addMenuForm.addEventListener('submit', async e => {
                    e.preventDefault();
                    const nameInput = addMenuForm.querySelector('input[type="text"]');
                    const priceInput = addMenuForm.querySelector('input[type="number"]');
                    const name = nameInput.value.trim();
                    const price = parseFloat(priceInput.value);

                    if (!name) { alert('กรุณากรอกชื่อเมนู'); return; }
                    if (isNaN(price) || price <= 0) { alert('กรุณากรอกราคาที่ถูกต้อง'); return; }

                    try {
                        await db.collection('menus').add({ name, price });
                        alert('เพิ่มเมนูใหม่เรียบร้อย!');
                        renderMenuFromFirestore();
                        addMenuForm.reset();
                    } catch (error) {
                        console.error("Error adding menu: ", error);
                        alert('เกิดข้อผิดพลาดในการเพิ่มเมนู: ' + error.message);
                    }
                });
            }
        } else if (currentPath.includes('buy.html')) {
            // The buy.html page has its own script for fetching menus and handling purchases.
            // No need to call a function from app.js here.
        } else if (currentPath.includes('customers.html')) {
            renderCustomersFromFirestore();
        } else if (currentPath.includes('orders.html')) {
            renderOrdersFromFirestore();
        } else if (currentPath.includes('promotion.html')) {
            renderPromotionsFromFirestore();
        } else if (currentPath.includes('reports.html')) {
            generateReports();
        }

    } else {
        // User is signed out. Redirect to login, unless it's the login page itself.
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }
});
