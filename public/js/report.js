let allVendors = [];
let resultChart = null;
let firstVisitChart = null;
let marketingAreaChart = null;

// گرفتن اطلاعات کاربر
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

// گرفتن توکن
function getToken() {
  return localStorage.getItem('token');
}

// گرفتن دیتا از سرور
async function fetchVendors(filters = {}) {
  const user = getUser();
  if (!user) return [];
  const res = await fetch('/api/vendor/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      role: user.role,
      userId: user.id,
      filters
    })
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// گرفتن نام‌های مناطق مارکتینگی از سرور
async function fetchMarketingAreas() {
  try {
    const res = await fetch('/api/vendor/marketing-areas', {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching marketing areas:', error);
    return [];
  }
}

// Function to format ISO date to readable format
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return isoString;
  }
}

// Function to open navigation to coordinates
function openNavigation(lat, lng) {
  if (lat && lng) {
    // Try to open in Google Maps first
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  }
}

// پر کردن جدول
function fillTable(vendors) {
  const tbody = document.querySelector('#vendorTable tbody');
  tbody.innerHTML = '';
  vendors.forEach(v => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.shop_name || ''}</td>
      <td>${v.manager_name || ''}</td>
      <td>${v.phone_number || ''}</td>
      <td>${v.shop_type || ''}</td>
      <td>${v.marketing_area_type || ''}</td>
      <td>${v.marketing_area_name || ''}</td>
      <td>${v.city || ''}</td>
      <td>${v.has_valid_license || ''}</td>
      <td>${v.has_rental_agreement || ''}</td>
      <td>${v.is_first_visit || ''}</td>
      <td>${v.contract_registered || ''}</td>
      <td>${formatDate(v.start_time) || ''}</td>
      <td>${formatDate(v.end_time) || ''}</td>
      <td>${v.negotiation_result || ''}</td>
      <td>${v.refuse_reason || ''}</td>
      <td>${v.description || ''}</td>
      <td>${v.promoter_name || ''}</td>
      <td>${v.photo ? `<img src="${v.photo}" alt="عکس" style="max-width:60px;max-height:60px;border-radius:6px;">` : ''}</td>
      <td>
        ${v.latitude && v.longitude ? 
          `<button onclick="openNavigation(${v.latitude}, ${v.longitude})" style="background:#0077cc;color:white;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:12px;">🗺️ مسیر</button>` : 
          '<span style="color:#999;">بدون مختصات</span>'
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// پر کردن فیلترها بر اساس دیتا
async function fillFilters(vendors) {
  const citySet = new Set();
  const typeSet = new Set();
  const marketingAreasSet = new Set();
    const promoterMap = new Map();
  vendors.forEach(v => {
    if (v.city) citySet.add(v.city);
    if (v.shop_type) typeSet.add(v.shop_type);
    if (v.marketing_area_name) marketingAreasSet.add(v.marketing_area_name);
    if (v.promoter_name && v.created_by) promoterMap.set(v.created_by, v.promoter_name);
  });
  
  // شهر
  const citySel = document.getElementById('filterCity');
  citySel.innerHTML = '<option value="">همه</option>';
  citySet.forEach(city => {
    citySel.innerHTML += `<option value="${city}">${city}</option>`;
  });
  
  // نوع فروشگاه
  const typeSel = document.getElementById('filterType');
  typeSel.innerHTML = '<option value="">همه</option>';
  typeSet.forEach(type => {
    typeSel.innerHTML += `<option value="${type}">${type}</option>`;
  });
  
  // شخص انجام‌دهنده
  const promoterSel = document.getElementById('filterPromoter');
  promoterSel.innerHTML = '<option value="">همه</option>';
  promoterMap.forEach((name, id) => {
    promoterSel.innerHTML += `<option value="${id}">${name}</option>`;
  });
  
  // نام منطقه مارکتینگی
  const marketingAreaSel = document.getElementById('filterMarketingAreaName');
  marketingAreaSel.innerHTML = '<option value="">همه</option>';
  marketingAreasSet.forEach(area => {
    marketingAreaSel.innerHTML += `<option value="${area}">${area}</option>`;
  });
}

// نمایش نمودار نتیجه مذاکره
function showResultChart(vendors) {
  const resultCount = {};
  vendors.forEach(v => {
    const key = v.negotiation_result || 'نامشخص';
    resultCount[key] = (resultCount[key] || 0) + 1;
  });
  const labels = Object.keys(resultCount);
  const data = Object.values(resultCount);
  const ctx = document.getElementById('resultChart').getContext('2d');
  if (resultChart) resultChart.destroy();
  resultChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'تعداد فروشگاه بر اساس نتیجه مذاکره',
        data,
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'نتیجه مذاکره'
        }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// نمایش نمودار مراجعه اول
function showFirstVisitChart(vendors) {
  const firstVisitCount = {};
  vendors.forEach(v => {
    const key = v.is_first_visit || 'نامشخص';
    firstVisitCount[key] = (firstVisitCount[key] || 0) + 1;
  });
  const labels = Object.keys(firstVisitCount);
  const data = Object.values(firstVisitCount);
  const ctx = document.getElementById('firstVisitChart').getContext('2d');
  if (firstVisitChart) firstVisitChart.destroy();
  firstVisitChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'تعداد فروشگاه بر اساس مراجعه اول',
        data,
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: 'مراجعه اول'
        }
      }
    }
  });
}

// نمایش نمودار نوع منطقه مارکتینگی
function showMarketingAreaChart(vendors) {
  const marketingAreaCount = {};
  vendors.forEach(v => {
    const key = v.marketing_area_type || 'نامشخص';
    marketingAreaCount[key] = (marketingAreaCount[key] || 0) + 1;
  });
  const labels = Object.keys(marketingAreaCount);
  const data = Object.values(marketingAreaCount);
  const ctx = document.getElementById('marketingAreaChart').getContext('2d');
  if (marketingAreaChart) marketingAreaChart.destroy();
  marketingAreaChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        label: 'تعداد فروشگاه بر اساس نوع منطقه مارکتینگی',
        data,
        backgroundColor: ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' },
        title: {
          display: true,
          text: 'نوع منطقه مارکتینگی'
        }
      }
    }
  });
}

// هندل کردن فیلتر و بارگذاری دیتا
async function handleFilter(e) {
  if (e) e.preventDefault();
  const filters = {
    city: document.getElementById('filterCity').value,
    shop_type: document.getElementById('filterType').value,
    marketing_area_type: document.getElementById('filterMarketingAreaType').value,
    marketing_area_name: document.getElementById('filterMarketingAreaName').value,
    has_valid_license: document.getElementById('filterHasValidLicense').value,
    has_rental_agreement: document.getElementById('filterHasRentalAgreement').value,
    is_first_visit: document.getElementById('filterIsFirstVisit').value,
    contract_registered: document.getElementById('filterContractRegistered').value,
    has_bank_account: document.getElementById('filterHasBankAccount').value,
    has_minimum_area: document.getElementById('filterHasMinimumArea').value,
    negotiation_result: document.getElementById('filterResult').value,
    refuse_reason: document.getElementById('filterRefuseReason').value,
    promoterId: document.getElementById('filterPromoter').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value
  };
  // حذف فیلدهای خالی
  Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k]; });
  const vendors = await fetchVendors(filters);
  fillTable(vendors);
  showResultChart(vendors);
  showFirstVisitChart(vendors);
  showMarketingAreaChart(vendors);
}

// بارگذاری اولیه
window.addEventListener('DOMContentLoaded', async () => {
  allVendors = await fetchVendors();
  await fillFilters(allVendors);
  fillTable(allVendors);
  showResultChart(allVendors);
  showFirstVisitChart(allVendors);
  showMarketingAreaChart(allVendors);
  document.getElementById('filterForm').addEventListener('submit', handleFilter);

  // افزودن فیلتر دلیل عدم همکاری
  const refuseReasonSel = document.getElementById('filterRefuseReason');
  if (refuseReasonSel) {
    refuseReasonSel.addEventListener('change', handleFilter);
  }

  // افزودن دکمه دانلود CSV
  const downloadCsvBtn = document.getElementById('downloadCsvBtn');
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener('click', function() {
      let csv = '';
      const headers = [
        'نام فروشگاه','نام مدیر','شماره تماس','نوع فروشگاه','نوع منطقه مارکتینگی','نام منطقه مارکتینگی','شهر','مراجعه اول','قرارداد ثبت شد','شروع مذاکره','پایان مذاکره','نتیجه مذاکره','دلیل عدم همکاری','توضیحات','انجام‌دهنده','عکس','مسیریابی'
      ];
      csv += headers.join(',') + '\n';
      allVendors.forEach(v => {
        const row = [
          v.shop_name || '',
          v.manager_name || '',
          v.phone_number || '',
          v.shop_type || '',
          v.marketing_area_type || '',
          v.marketing_area_name || '',
          v.city || '',
          v.is_first_visit || '',
          v.contract_registered || '',
          formatDate(v.start_time) || '',
          formatDate(v.end_time) || '',
          v.negotiation_result || '',
          v.refuse_reason || '',
          v.description || '',
          v.promoter_name || '',
          v.photo ? '[عکس]' : '',
          (v.latitude && v.longitude) ? `https://www.google.com/maps/dir/?api=1&destination=${v.latitude},${v.longitude}` : ''
        ];
        csv += row.map(x => '"' + (x ? x.toString().replace(/"/g, '""') : '') + '"').join(',') + '\n';
      });
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'vendors_report.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});
  