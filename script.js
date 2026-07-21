// Data & State Management
const STATUS_CONFIG = {
    'ยังไม่เริ่ม': { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    'กำลังดำเนินการ': { color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
    'เสร็จสมบูรณ์แล้ว': { color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' }
};

let complaints = [];
let currentFilter = 'ทั้งหมด';
let timeFilterVal = 'ทั้งหมด';
let actionCallback = null; // For confirm modal
let currentPage = 1; // สำหรับแบ่งหน้ารายการคำร้อง
const ITEMS_PER_PAGE = 9; // จำนวนการ์ดต่อหน้า

// Sample Mock Data (Loaded if localStorage is empty)
const MOCK_DATA = [
    {
        id: 1, title: "ไฟฟ้าส่องว่างสาธารณะดับตลอดเส้นทาง", receiveNo: "125/2569", requester: "นางมาลี รักดี",
        supervisor: "นายวิทยา สุขใจ", department: "งานโยธา", subDepartment: "ชุดไฟฟ้า", zone: "เขต 2",
        startDate: "2026-07-10", contactType: "เบอร์โทรศัพท์", contactInfo: "0811112222",
        status: "กำลังดำเนินการ", note: "รอประสานงานการไฟฟ้า", completedDate: "",
        beforeImg: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?auto=format&fit=crop&w=600&q=80", afterImg: ""
    },
    {
        id: 2, title: "ถนนชำรุดเป็นหลุมบ่อขนาดใหญ่เป็นระยะทางยาว", receiveNo: "126/2569", requester: "นายสมศักดิ์ ใจดี",
        supervisor: "นายวิทยา สุขใจ", department: "งานโยธา", subDepartment: "ชุดซ่อมปะถนน", zone: "เขต 2",
        startDate: "2026-06-28", contactType: "เบอร์โทรศัพท์", contactInfo: "0822223333",
        status: "เสร็จสมบูรณ์แล้ว", note: "", completedDate: "2026-07-01",
        beforeImg: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80",
        afterImg: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=600&q=80"
    }
];

const SESSION_KEY = 'sateangnok_session';

// Initialize icons on load
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    loadData();
    setupEventListeners();

    // ถ้าเคยเข้าสู่ระบบไว้แล้ว (มี session ค้างอยู่) ให้ข้ามหน้า Login ไปเลย
    if (localStorage.getItem(SESSION_KEY) === 'active') {
        document.getElementById('login-view').classList.add('hidden');
        const appLayout = document.getElementById('app-layout');
        appLayout.classList.remove('hidden');
        navigate('dashboard');
        lucide.createIcons();
    }
});

function loadData() {
    const saved = localStorage.getItem('sateangnok_complaints');
    if (saved) {
        try {
            complaints = JSON.parse(saved);
        } catch (e) { complaints = [...MOCK_DATA]; }
    } else {
        complaints = [...MOCK_DATA];
        saveData();
    }
}

function saveData() {
    localStorage.setItem('sateangnok_complaints', JSON.stringify(complaints));
}

// Custom Toast Notification (Replaces alert)
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-white' : 'bg-red-50';
    const borderColor = isSuccess ? 'border-emerald-200' : 'border-red-200';
    const iconColor = isSuccess ? 'text-emerald-500' : 'text-red-500';
    const iconName = isSuccess ? 'check-circle-2' : 'alert-circle';
    const textColor = isSuccess ? 'text-gray-800' : 'text-red-800';

    toast.className = `flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl border ${borderColor} ${bgColor} toast-enter mb-2 pointer-events-auto`;
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="w-6 h-6 ${iconColor} flex-shrink-0"></i>
        <p class="text-sm font-bold ${textColor}">${message}</p>
    `;
    
    container.appendChild(toast);
    lucide.createIcons({ root: toast });

    setTimeout(() => {
        toast.classList.replace('toast-enter', 'toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Toggle Password Visibility (Login field)
function togglePasswordVisibility() {
    const input = document.getElementById('login-password');
    const btn = document.getElementById('toggle-password-btn');
    const isHidden = input.type === 'password';

    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = `<i id="toggle-password-icon" data-lucide="${isHidden ? 'eye-off' : 'eye'}" class="w-4 h-4"></i>`;
    lucide.createIcons({ root: btn });
}

// Authentication Mock
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    
    // Check credentials
    if (user !== 'stnkongchang' || pass !== 'ytctest2026') {
        showToast('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง!', 'error');
        return;
    }

    document.getElementById('login-view').classList.add('opacity-0');
    setTimeout(() => {
        document.getElementById('login-view').classList.add('hidden');
        const appLayout = document.getElementById('app-layout');
        appLayout.classList.remove('hidden');
        appLayout.classList.add('fade-in');
        navigate('dashboard');
        showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ');
        localStorage.setItem(SESSION_KEY, 'active'); // จดจำสถานะการเข้าสู่ระบบไว้ ป้องกันหลุดเมื่อกด F5
    }, 500);
});

function logout() {
    localStorage.removeItem(SESSION_KEY); // ล้างสถานะ session เมื่อออกจากระบบ
    document.documentElement.classList.remove('has-session'); // ปิดการบังคับแสดงผลแบบ anti-flash
    document.getElementById('app-layout').classList.add('hidden');
    const login = document.getElementById('login-view');
    login.classList.remove('hidden', 'opacity-0');
    login.classList.add('fade-in');
}

// Navigation
function navigate(viewName) {
    document.getElementById('view-dashboard').classList.add('hidden');
    document.getElementById('view-form').classList.add('hidden');
    
    // reset nav styles
    document.getElementById('nav-dashboard').className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5 text-emerald-100 hover:text-white";
    document.getElementById('nav-form').className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:bg-white/5 text-emerald-100 hover:text-white";

    if (viewName === 'dashboard') {
        document.getElementById('view-dashboard').classList.remove('hidden');
        document.getElementById('nav-dashboard').className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-emerald-900/60 shadow-inner";
        renderDashboard();
    } else if (viewName === 'form') {
        document.getElementById('view-form').classList.remove('hidden');
        document.getElementById('nav-form').className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all bg-emerald-900/60 shadow-inner";
        window.scrollTo(0,0);
    }
}

function openForm(id = null) {
    resetForm();
    if (id) {
        const item = complaints.find(c => c.id === id);
        if (item) populateForm(item);
        document.getElementById('form-title').innerHTML = `<i data-lucide="edit" class="w-6 h-6 text-brand"></i> แก้ไขข้อมูลคำร้อง (ID: ${id})`;
    } else {
        document.getElementById('form-title').innerHTML = `<i data-lucide="file-edit" class="w-6 h-6 text-brand"></i> บันทึกข้อมูลคำร้องใหม่`;
    }
    lucide.createIcons();
    navigate('form');
}

// Confirm Modal
function openConfirmModal(message, callback) {
    document.getElementById('confirm-message').textContent = message;
    document.getElementById('confirm-modal').classList.remove('hidden');
    actionCallback = callback;
}
function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    actionCallback = null;
}
document.getElementById('btn-confirm-action').addEventListener('click', () => {
    if (actionCallback) actionCallback();
    closeConfirmModal();
});

// Image Viewer Lightbox
function openImageViewer(src) {
    if (!src || src.includes('placehold.co')) return;
    document.getElementById('image-viewer-img').src = src;
    document.getElementById('image-viewer-modal').classList.remove('hidden');
}
function closeImageViewer() {
    document.getElementById('image-viewer-modal').classList.add('hidden');
}

// Detail Modal
function viewDetail(id) {
    const item = complaints.find(c => c.id === id);
    if(!item) return;

    const st = STATUS_CONFIG[item.status];
    document.getElementById('dt-status').className = `inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${st.bg} ${st.color}`;
    document.getElementById('dt-status').textContent = item.status;
    
    document.getElementById('dt-title').textContent = item.title;
    document.getElementById('dt-no').textContent = item.receiveNo ? `เลขรับ: ${item.receiveNo}` : 'ไม่มีเลขรับ';
    
    document.getElementById('dt-requester').textContent = item.requester;
    document.getElementById('dt-contact').textContent = `${item.contactType}: ${item.contactInfo}`;
    document.getElementById('dt-zone').textContent = item.zone;
    document.getElementById('dt-dept').textContent = item.department + (item.subDepartment ? ` (${item.subDepartment})` : '');
    document.getElementById('dt-supervisor').textContent = item.supervisor;
    
    // Format Thai Date
    const dObj = new Date(item.startDate);
    document.getElementById('dt-date').textContent = !isNaN(dObj) ? dObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric'}) : item.startDate;

    // Note Section
    const noteEl = document.getElementById('dt-note-section');
    if(item.status !== 'เสร็จสมบูรณ์แล้ว' && item.note) {
        document.getElementById('dt-note').textContent = item.note;
        noteEl.classList.remove('hidden');
    } else {
        noteEl.classList.add('hidden');
    }

    // Images Section
    const imgBefore = document.getElementById('dt-img-before');
    const imgAfter = document.getElementById('dt-img-after');
    const afterContainer = document.getElementById('dt-after-container');
    const completeDate = document.getElementById('dt-completed-date');

    imgBefore.src = item.beforeImg || '';
    imgAfter.src = item.afterImg || '';

    if (item.status === 'เสร็จสมบูรณ์แล้ว') {
        afterContainer.classList.remove('hidden');
        if(item.completedDate) {
            const cObj = new Date(item.completedDate);
            completeDate.textContent = "ดำเนินการเสร็จเมื่อ: " + (!isNaN(cObj) ? cObj.toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric'}) : item.completedDate);
            completeDate.classList.remove('hidden');
        } else {
            completeDate.classList.add('hidden');
        }
    } else {
        afterContainer.classList.add('hidden');
        completeDate.classList.add('hidden');
    }

    // Actions
    document.getElementById('dt-btn-edit').onclick = () => { closeDetailModal(); openForm(item.id); };
    document.getElementById('dt-btn-delete').onclick = () => { deleteItem(item.id); };

    document.getElementById('detail-modal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detail-modal').classList.add('hidden');
}

// Dashboard Render
function setFilter(status) {
    currentFilter = status;
    currentPage = 1;
    
    // Update UI styles for filter cards
    document.querySelectorAll('.stat-card').forEach(card => {
        if(card.dataset.filter === status) {
            card.classList.remove('opacity-60');
            card.classList.add('ring-2');
        } else {
            card.classList.add('opacity-60');
            card.classList.remove('ring-2');
        }
    });

    // Sync with dropdown filter
    const statusDropdown = document.getElementById('filter-status');
    if (statusDropdown && statusDropdown.value !== status) {
        statusDropdown.value = status;
    }

    renderDashboard();
}

function renderDashboard() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Filter logic
    let filtered = complaints.filter(c => {
        // 1. Status Filter
        const matchStatus = currentFilter === 'ทั้งหมด' || c.status === currentFilter;
        
        // 2. Department Filter
        const deptVal = document.getElementById('filter-dept').value;
        const matchDept = deptVal === 'ทั้งหมด' || c.department === deptVal;

        // 3. Zone Filter
        const zoneVal = document.getElementById('filter-zone').value;
        const matchZone = zoneVal === 'ทั้งหมด' || c.zone === zoneVal;

        // 4. Search Filter
        const matchSearch = c.title.toLowerCase().includes(searchTerm) || 
                            (c.receiveNo && c.receiveNo.toLowerCase().includes(searchTerm)) ||
                            c.requester.toLowerCase().includes(searchTerm) ||
                            (c.supervisor && c.supervisor.toLowerCase().includes(searchTerm));
                            
        // 5. Time Filter
        let matchTime = true;
        if (c.startDate && timeFilterVal !== 'ทั้งหมด') {
            // ป้องกันปัญหา Timezone โดยอ่านค่าแยกส่วน
            const [cYear, cMonth, cDay] = c.startDate.split('-').map(Number);
            const cDateOnly = new Date(cYear, cMonth - 1, cDay);

            if (timeFilterVal === 'วันนี้') {
                matchTime = cDateOnly.getTime() === today.getTime();
            } else if (timeFilterVal === 'สัปดาห์นี้') {
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
                const endOfWeek = new Date(today);
                endOfWeek.setDate(today.getDate() - today.getDay() + 6); // Saturday
                matchTime = cDateOnly >= startOfWeek && cDateOnly <= endOfWeek;
            } else if (timeFilterVal === 'เดือนนี้') {
                matchTime = cDateOnly.getMonth() === today.getMonth() && cDateOnly.getFullYear() === today.getFullYear();
            } else if (timeFilterVal === 'ปีนี้') {
                matchTime = cDateOnly.getFullYear() === today.getFullYear();
            } else if (timeFilterVal === 'กำหนดเอง') {
                const customDateVal = document.getElementById('filter-custom-date').value;
                if(customDateVal) {
                    const [sYear, sMonth, sDay] = customDateVal.split('-').map(Number);
                    const cDate = new Date(sYear, sMonth - 1, sDay);
                    matchTime = cDateOnly.getTime() === cDate.getTime();
                }
            }
        }

        return matchStatus && matchSearch && matchTime && matchDept && matchZone;
    });

    // Update Stats
    document.getElementById('stat-total').textContent = complaints.length;
    document.getElementById('stat-pending').textContent = complaints.filter(c=>c.status==='ยังไม่เริ่ม').length;
    document.getElementById('stat-progress').textContent = complaints.filter(c=>c.status==='กำลังดำเนินการ').length;
    document.getElementById('stat-done').textContent = complaints.filter(c=>c.status==='เสร็จสมบูรณ์แล้ว').length;

    // Render Chart
    renderChart();

    const container = document.getElementById('complaints-container');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center p-10 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                <i data-lucide="folder-search" class="w-12 h-12 mb-3"></i>
                <p class="font-semibold">ไม่พบข้อมูลคำร้อง</p>
            </div>`;
        lucide.createIcons();
        renderPagination(0, 1);
        return;
    }

    // Sort newest first
    filtered.sort((a,b) => new Date(b.startDate) - new Date(a.startDate));

    // แบ่งหน้า (Pagination)
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    pageItems.forEach(c => {
        const st = STATUS_CONFIG[c.status];
        
        // Format date roughly
        const dObj = new Date(c.startDate);
        const dStr = !isNaN(dObj) ? dObj.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit'}) : c.startDate;

        // Determine which image to show (After img has priority if finished, else Before img, else Placeholder)
        const displayImg = c.afterImg ? c.afterImg : (c.beforeImg ? c.beforeImg : 'https://placehold.co/600x400/eeeeee/999999?text=ไม่มีรูปภาพ');

        const card = document.createElement('div');
        card.className = "bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col group relative overflow-hidden";
        card.onclick = () => viewDetail(c.id);

        // Add a small color strip on top based on status
        let stripColor = c.status === 'เสร็จสมบูรณ์แล้ว' ? 'bg-emerald-500' : (c.status === 'กำลังดำเนินการ' ? 'bg-blue-500' : 'bg-amber-500');

        card.innerHTML = `
            <div class="absolute top-0 left-0 right-0 h-1 ${stripColor} z-10"></div>
            
            <!-- Cover Image -->
            <div class="w-full h-36 bg-gray-100 overflow-hidden relative">
                <img src="${displayImg}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="รูปภาพประกอบ" onerror="this.src='https://placehold.co/600x400/eeeeee/999999?text=ไม่มีรูปภาพ'">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span class="px-2.5 py-1 rounded-md text-[10px] font-bold ${st.bg} ${st.color} border ${st.border} shadow-sm backdrop-blur-md bg-opacity-90">${c.status}</span>
                    <span class="text-[10px] text-white font-medium drop-shadow-md bg-black/30 px-2 py-0.5 rounded-md backdrop-blur-sm">${dStr}</span>
                </div>
            </div>

            <!-- Card Body -->
            <div class="p-4 flex flex-col flex-1">
                <h3 class="font-bold text-gray-800 mb-2 leading-snug line-clamp-2 group-hover:text-brand transition-colors">${c.title}</h3>
                <div class="space-y-1 mb-4 flex-1">
                    <p class="text-xs text-gray-500 flex items-center gap-1.5"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-gray-400"></i> ${c.zone}</p>
                    <p class="text-xs text-gray-500 flex items-center gap-1.5"><i data-lucide="user" class="w-3.5 h-3.5 text-gray-400"></i> ผู้ร้อง: ${c.requester}</p>
                    <p class="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1"><i data-lucide="hard-hat" class="w-3.5 h-3.5 text-gray-400"></i> รับผิดชอบ: ${c.department}</p>
                </div>
                <div class="pt-3 border-t border-gray-50 flex items-center justify-between mt-auto">
                    <p class="text-[10px] font-semibold text-gray-400">ID: ${c.receiveNo || c.id}</p>
                    <button class="text-brand text-xs font-bold hover:underline flex items-center gap-1">ดูรายละเอียด <i data-lucide="chevron-right" class="w-3 h-3"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    lucide.createIcons({ root: container });
    renderPagination(filtered.length, totalPages);
}

// สร้างแถบเลขหน้า (Pagination Controls)
function renderPagination(totalItems, totalPages) {
    const pagContainer = document.getElementById('pagination-container');
    if (!pagContainer) return;
    pagContainer.innerHTML = '';

    if (totalItems === 0 || totalPages <= 1) return;

    const baseBtn = "min-w-[38px] h-[38px] px-2 flex items-center justify-center rounded-xl text-sm font-bold transition-all";
    const inactiveBtn = `${baseBtn} bg-white border border-gray-200 text-gray-600 hover:bg-gray-50`;
    const activeBtn = `${baseBtn} bg-brand text-white shadow-md`;
    const disabledBtn = `${baseBtn} bg-gray-50 border border-gray-100 text-gray-300 cursor-not-allowed`;

    const wrapper = document.createElement('div');
    wrapper.className = "flex items-center justify-center flex-wrap gap-2";

    // ปุ่มก่อนหน้า
    const prevBtn = document.createElement('button');
    prevBtn.className = currentPage === 1 ? disabledBtn : inactiveBtn;
    prevBtn.innerHTML = `<i data-lucide="chevron-left" class="w-4 h-4"></i>`;
    if (currentPage !== 1) prevBtn.onclick = () => changePage(currentPage - 1);
    wrapper.appendChild(prevBtn);

    // คำนวณช่วงเลขหน้าที่จะแสดง (แสดงหน้าแรก, หน้าสุดท้าย, และหน้าใกล้เคียงหน้าปัจจุบัน)
    const pagesToShow = new Set();
    pagesToShow.add(1);
    pagesToShow.add(totalPages);
    for (let p = currentPage - 1; p <= currentPage + 1; p++) {
        if (p >= 1 && p <= totalPages) pagesToShow.add(p);
    }
    const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);

    let lastPage = 0;
    sortedPages.forEach(p => {
        if (lastPage && p - lastPage > 1) {
            const dots = document.createElement('span');
            dots.className = "min-w-[38px] h-[38px] flex items-center justify-center text-gray-400 text-sm font-bold";
            dots.textContent = '...';
            wrapper.appendChild(dots);
        }
        const pageBtn = document.createElement('button');
        pageBtn.className = p === currentPage ? activeBtn : inactiveBtn;
        pageBtn.textContent = p;
        pageBtn.onclick = () => changePage(p);
        wrapper.appendChild(pageBtn);
        lastPage = p;
    });

    // ปุ่มถัดไป
    const nextBtn = document.createElement('button');
    nextBtn.className = currentPage === totalPages ? disabledBtn : inactiveBtn;
    nextBtn.innerHTML = `<i data-lucide="chevron-right" class="w-4 h-4"></i>`;
    if (currentPage !== totalPages) nextBtn.onclick = () => changePage(currentPage + 1);
    wrapper.appendChild(nextBtn);

    pagContainer.appendChild(wrapper);
    lucide.createIcons({ root: pagContainer });
}

// เปลี่ยนหน้าที่กำลังแสดง
function changePage(page) {
    currentPage = page;
    renderDashboard();
    const container = document.getElementById('complaints-container');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Render D3 Chart function
function renderChart() {
    const container = document.getElementById('status-chart');
    if (!container) return;
    container.innerHTML = ''; // Clear old chart
    
    const counts = [
        { label: 'ยังไม่เริ่ม', value: complaints.filter(c=>c.status==='ยังไม่เริ่ม').length, color: '#fbbf24' },
        { label: 'กำลังดำเนินการ', value: complaints.filter(c=>c.status==='กำลังดำเนินการ').length, color: '#3b82f6' },
        { label: 'เสร็จสมบูรณ์', value: complaints.filter(c=>c.status==='เสร็จสมบูรณ์แล้ว').length, color: '#10b981' }
    ];

    const total = counts.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        container.innerHTML = '<p class="text-gray-400 text-sm font-medium">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>';
        return;
    }

    // Create Flex Container for Chart + Legend
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-col md:flex-row items-center justify-center w-full h-full gap-8";
    container.appendChild(wrapper);

    const chartDiv = document.createElement('div');
    chartDiv.className = "relative w-48 h-48 flex-shrink-0";
    wrapper.appendChild(chartDiv);

    const legendDiv = document.createElement('div');
    legendDiv.className = "flex flex-col gap-4 min-w-[150px]";
    wrapper.appendChild(legendDiv);

    // Build HTML Legend
    counts.forEach(c => {
        legendDiv.innerHTML += `
            <div class="flex items-center gap-3">
                <span class="w-4 h-4 rounded-full shadow-sm" style="background-color: ${c.color};"></span>
                <span class="text-sm font-medium text-gray-600">${c.label}</span>
                <span class="text-sm font-black text-gray-800 ml-auto pl-4">${c.value}</span>
            </div>
        `;
    });

    // Set dimensions for D3 Donut Chart
    const width = 192; 
    const height = 192;
    const margin = 5;
    const radius = Math.min(width, height) / 2 - margin;

    const svg = d3.select(chartDiv)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie()
        .value(d => d.value)
        .sort(null); // Keep original order
    
    const activeData = counts.filter(d => d.value > 0);
    const data_ready = pie(activeData);

    const arcGenerator = d3.arc()
        .innerRadius(radius * 0.55) // Donut thickness
        .outerRadius(radius);

    // Draw Slices with hover animation
    svg.selectAll('path')
        .data(data_ready)
        .join('path')
        .attr('d', arcGenerator)
        .attr('fill', d => d.data.color)
        .attr("stroke", "#ffffff")
        .style("stroke-width", "3px")
        .style("transition", "transform 0.2s ease-in-out")
        .on("mouseover", function() { d3.select(this).attr("transform", "scale(1.05)"); })
        .on("mouseout", function() { d3.select(this).attr("transform", "scale(1)"); });

    // Add Values inside Slices
    svg.selectAll('text.val')
        .data(data_ready)
        .join('text')
        .text(d => d.data.value)
        .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-family", "'Prompt', sans-serif")
        .style("fill", "#ffffff")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .attr("dy", "0.35em"); // vertically center

    // Add Total in the center of Donut
    svg.append("text")
        .attr("text-anchor", "middle")
        .text("ทั้งหมด")
        .style("font-size", "12px")
        .style("fill", "#9ca3af")
        .style("font-family", "'Prompt', sans-serif")
        .attr("dy", "-0.6em");
        
    svg.append("text")
        .attr("text-anchor", "middle")
        .text(total)
        .style("font-size", "24px")
        .style("fill", "#1f2937")
        .style("font-weight", "900")
        .style("font-family", "'Prompt', sans-serif")
        .attr("dy", "0.7em");
}

// Setup Form Event Listeners
function setupEventListeners() {
    document.getElementById('search-input').addEventListener('input', () => { currentPage = 1; renderDashboard(); });
    
    // Time filter handling (PILLS)
    const timeBtns = document.querySelectorAll('.time-btn');
    const customDateContainer = document.getElementById('custom-date-container');

    timeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Reset all buttons styling
            timeBtns.forEach(b => {
                b.className = "time-btn px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 bg-white transition-colors whitespace-nowrap";
            });
            
            // Set active styling to clicked button
            e.target.className = "time-btn px-4 py-2 rounded-full bg-slate-800 text-white text-sm font-medium shadow-sm transition-colors whitespace-nowrap";
            
            timeFilterVal = e.target.getAttribute('data-val');
            currentPage = 1;
            
            if (timeFilterVal === 'กำหนดเอง') {
                customDateContainer.classList.remove('hidden');
                customDateContainer.classList.add('flex');
            } else {
                customDateContainer.classList.add('hidden');
                customDateContainer.classList.remove('flex');
                renderDashboard();
            }
        });
    });

    // Dropdowns
    document.getElementById('filter-status').addEventListener('change', (e) => setFilter(e.target.value));
    document.getElementById('filter-dept').addEventListener('change', () => { currentPage = 1; renderDashboard(); });
    document.getElementById('filter-zone').addEventListener('change', () => { currentPage = 1; renderDashboard(); });

    // Custom Dates
    document.getElementById('filter-custom-date').addEventListener('change', () => { if (timeFilterVal === 'กำหนดเอง') { currentPage = 1; renderDashboard(); } });

    // Re-render chart on window resize to keep it responsive
    window.addEventListener('resize', () => {
        if (!document.getElementById('view-dashboard').classList.contains('hidden')) {
            renderChart();
        }
    });

    const deptSelect = document.getElementById('f-department');
    const subDeptContainer = document.getElementById('sub-department-container');
    const subDeptSelect = document.getElementById('f-subDepartment');

    deptSelect.addEventListener('change', (e) => {
        if (e.target.value === 'งานโยธา') {
            subDeptContainer.classList.remove('hidden');
            subDeptSelect.setAttribute('required', 'true');
        } else {
            subDeptContainer.classList.add('hidden');
            subDeptSelect.removeAttribute('required');
            subDeptSelect.value = '';
        }
    });

    const statusSelect = document.getElementById('f-status');
    const noteContainer = document.getElementById('note-container');
    const noteInput = document.getElementById('f-note');
    const finishedContainer = document.getElementById('finished-container');
    const completedDateInput = document.getElementById('f-completedDate');

    statusSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'เสร็จสมบูรณ์แล้ว') {
            noteContainer.classList.add('hidden');
            finishedContainer.classList.remove('hidden');
            completedDateInput.setAttribute('required', 'true');
        } else {
            noteContainer.classList.remove('hidden');
            finishedContainer.classList.add('hidden');
            completedDateInput.removeAttribute('required');
        }
    });

    // Image Upload Handlers
    setupImageUpload('f-beforeFile', 'preview-before', 'f-beforeImgData', 'preview-before-container');
    setupImageUpload('f-afterFile', 'preview-after', 'f-afterImgData', 'preview-after-container');

    // Form Submit
    document.getElementById('complaint-form').addEventListener('submit', saveForm);
}

function setupImageUpload(inputId, imgId, dataId, containerId) {
    document.getElementById(inputId).addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Check size (< 5MB)
            if(file.size > 5 * 1024 * 1024) {
                showToast('ขนาดไฟล์ภาพใหญ่เกินไป (จำกัด 5MB)', 'error');
                e.target.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(evt) {
                document.getElementById(imgId).src = evt.target.result;
                document.getElementById(dataId).value = evt.target.result;
                document.getElementById(containerId).classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });
}

function removeImage(type) {
    const inputId = type === 'before' ? 'f-beforeFile' : 'f-afterFile';
    const imgId = type === 'before' ? 'preview-before' : 'preview-after';
    const dataId = type === 'before' ? 'f-beforeImgData' : 'f-afterImgData';
    const containerId = type === 'before' ? 'preview-before-container' : 'preview-after-container';

    document.getElementById(inputId).value = '';
    document.getElementById(imgId).src = '';
    document.getElementById(dataId).value = '';
    document.getElementById(containerId).classList.add('hidden');
}

function resetForm() {
    document.getElementById('complaint-form').reset();
    document.getElementById('entry-id').value = '';
    
    // reset UI state
    document.getElementById('sub-department-container').classList.add('hidden');
    document.getElementById('f-subDepartment').removeAttribute('required');
    
    document.getElementById('f-status').value = 'ยังไม่เริ่ม';
    document.getElementById('note-container').classList.remove('hidden');
    document.getElementById('finished-container').classList.add('hidden');
    document.getElementById('f-completedDate').removeAttribute('required');

    removeImage('before');
    removeImage('after');

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('f-startDate').value = today;
}

function populateForm(item) {
    document.getElementById('entry-id').value = item.id;
    document.getElementById('f-title').value = item.title;
    document.getElementById('f-receiveNo').value = item.receiveNo;
    document.getElementById('f-requester').value = item.requester;
    document.getElementById('f-supervisor').value = item.supervisor;
    
    const dept = document.getElementById('f-department');
    dept.value = item.department;
    dept.dispatchEvent(new Event('change')); // Trigger visibility
    
    if(item.subDepartment) document.getElementById('f-subDepartment').value = item.subDepartment;
    
    document.getElementById('f-zone').value = item.zone;
    document.getElementById('f-startDate').value = item.startDate;
    document.getElementById('f-contactType').value = item.contactType;
    document.getElementById('f-contactInfo').value = item.contactInfo;
    
    const stat = document.getElementById('f-status');
    stat.value = item.status;
    stat.dispatchEvent(new Event('change'));

    if (item.note) document.getElementById('f-note').value = item.note;
    if (item.completedDate) document.getElementById('f-completedDate').value = item.completedDate;

    if (item.beforeImg) {
        document.getElementById('preview-before').src = item.beforeImg;
        document.getElementById('f-beforeImgData').value = item.beforeImg;
        document.getElementById('preview-before-container').classList.remove('hidden');
    }
    if (item.afterImg) {
        document.getElementById('preview-after').src = item.afterImg;
        document.getElementById('f-afterImgData').value = item.afterImg;
        document.getElementById('preview-after-container').classList.remove('hidden');
    }
}

function saveForm(e) {
    e.preventDefault();
    
    const id = document.getElementById('entry-id').value;
    const isNew = !id;

    const newItem = {
        id: isNew ? Date.now() : parseInt(id),
        title: document.getElementById('f-title').value,
        receiveNo: document.getElementById('f-receiveNo').value,
        requester: document.getElementById('f-requester').value,
        supervisor: document.getElementById('f-supervisor').value,
        department: document.getElementById('f-department').value,
        subDepartment: document.getElementById('f-subDepartment').value,
        zone: document.getElementById('f-zone').value,
        startDate: document.getElementById('f-startDate').value,
        contactType: document.getElementById('f-contactType').value,
        contactInfo: document.getElementById('f-contactInfo').value,
        status: document.getElementById('f-status').value,
        note: document.getElementById('f-note').value,
        completedDate: document.getElementById('f-completedDate').value,
        beforeImg: document.getElementById('f-beforeImgData').value,
        afterImg: document.getElementById('f-afterImgData').value,
    };

    if (isNew) {
        complaints.push(newItem);
        showToast('บันทึกคำร้องใหม่สำเร็จ');
    } else {
        const idx = complaints.findIndex(c => c.id === parseInt(id));
        if (idx !== -1) {
            complaints[idx] = newItem;
            showToast('อัปเดตข้อมูลสำเร็จ');
        }
    }

    saveData();
    navigate('dashboard');
}

function deleteItem(id) {
    openConfirmModal('คุณแน่ใจหรือไม่ที่จะลบคำร้องนี้? ข้อมูลจะไม่สามารถกู้คืนได้', () => {
        complaints = complaints.filter(c => c.id !== id);
        saveData();
        closeDetailModal();
        renderDashboard();
        showToast('ลบคำร้องเรียบร้อยแล้ว');
    });
}
